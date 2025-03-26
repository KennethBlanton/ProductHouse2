// backend/src/functions/users/updateOnboardingStep.js
const AWS = require('aws-sdk');
const { 
  initializeOnboarding, 
  updateStepCompletion, 
  isValidStepTransition,
  validateProfile,
  validatePreferences
} = require('../../models/userOnboarding');

const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * Update user's onboarding step
 * @param {Object} event Lambda event object
 * @returns {Object} Lambda response
 */
exports.handler = async (event) => {
  try {
    // Extract user ID from path parameters or cognito sub
    const userId = event.pathParameters?.userId || 
                  event.requestContext?.authorizer?.claims?.sub;

    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          message: 'User ID is required' 
        })
      };
    }

    // Parse request body
    const { 
      step, 
      isComplete, 
      stepData,
      moveToNext 
    } = JSON.parse(event.body);
    
    if (!step) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          message: 'Step name is required' 
        })
      };
    }

    // Get user from DynamoDB
    const params = {
      TableName: process.env.USERS_TABLE,
      Key: { id: userId },
      ProjectionExpression: 'id, onboarding, firstName, lastName'
    };

    const { Item: user } = await dynamoDB.get(params).promise();

    if (!user) {
      return {
        statusCode: 404,
        body: JSON.stringify({ 
          message: 'User not found' 
        })
      };
    }

    // Get current onboarding state or initialize if not set
    let onboarding = user.onboarding || initializeOnboarding({
      firstName: user.firstName || '',
      lastName: user.lastName || ''
    });
    
    // Validate step data if provided
    if (stepData) {
      const validationResult = validateStepData(step, stepData);
      if (!validationResult.isValid) {
        return {
          statusCode: 400,
          body: JSON.stringify({ 
            message: `Invalid data for step '${step}'`,
            errors: validationResult.errors
          })
        };
      }
      
      // Merge step data into onboarding state
      onboarding = {
        ...onboarding,
        [step]: {
          ...onboarding[step],
          ...stepData
        }
      };
    }

    // Update step completion
    if (isComplete !== undefined) {
      onboarding = updateStepCompletion(onboarding, step, isComplete);
    }
    
    // Update current step if requested to move to next
    if (moveToNext && onboarding.steps[step].isComplete) {
      const currentStep = onboarding.currentStep;
      const validNextSteps = onboarding.steps[step].isComplete ? 
                           getValidNextSteps(onboarding, currentStep) : 
                           [currentStep];
      
      if (validNextSteps.length > 0) {
        onboarding.currentStep = validNextSteps[0];
      }
    }

    // Update onboarding state in DynamoDB
    const updateParams = {
      TableName: process.env.USERS_TABLE,
      Key: { id: userId },
      UpdateExpression: 'SET onboarding = :onboarding, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':onboarding': onboarding,
        ':updatedAt': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    };

    const { Attributes: updatedUser } = await dynamoDB.update(updateParams).promise();
    
    // If profile step was completed, update user profile data
    if (step === 'profile' && isComplete) {
      await syncProfileData(userId, onboarding.profile);
    }
    
    // If preferences step was completed, update user preferences
    if (step === 'preferences' && isComplete) {
      await syncPreferencesData(userId, onboarding.preferences);
    }
    
    // If onboarding is now complete, trigger onboarding completion event
    if (onboarding.isComplete && (!user.onboarding || !user.onboarding.isComplete)) {
      await triggerOnboardingComplete(userId, onboarding);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Onboarding step '${step}' updated successfully`,
        userId: updatedUser.id,
        onboarding: updatedUser.onboarding,
        nextStep: updatedUser.onboarding.currentStep
      })
    };
  } catch (error) {
    console.error('Error updating onboarding step:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Failed to update onboarding step',
        error: error.message 
      })
    };
  }
};

/**
 * Get valid next steps based on current step
 * @param {Object} onboarding Onboarding state
 * @param {string} currentStep Current step
 * @returns {string[]} Valid next steps
 */
function getValidNextSteps(onboarding, currentStep) {
  // First see if there are valid transitions
  const transitions = require('../../models/userOnboarding').STEP_TRANSITIONS[currentStep] || [];
  
  // Filter to steps that make sense (e.g., not already completed)
  return transitions.filter(step => !onboarding.steps[step].isComplete);
}

/**
 * Validate step data based on step type
 * @param {string} step Step name
 * @param {Object} data Step data
 * @returns {Object} Validation result
 */
function validateStepData(step, data) {
  switch (step) {
    case 'profile':
      return validateProfile(data);
    case 'preferences':
      return validatePreferences(data);
    default:
      // No specific validation for other steps
      return { isValid: true, errors: [] };
  }
}

/**
 * Sync profile data to user record
 * @param {string} userId User ID
 * @param {Object} profileData Profile data
 */
async function syncProfileData(userId, profileData) {
  try {
    // Update user profile in DynamoDB
    const updateParams = {
      TableName: process.env.USERS_TABLE,
      Key: { id: userId },
      UpdateExpression: 'SET firstName = :firstName, lastName = :lastName, jobTitle = :jobTitle, company = :company, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':firstName': profileData.name.firstName,
        ':lastName': profileData.name.lastName,
        ':jobTitle': profileData.jobTitle || null,
        ':company': profileData.company || null,
        ':updatedAt': new Date().toISOString()
      }
    };

    await dynamoDB.update(updateParams).promise();
  } catch (error) {
    console.error('Error syncing profile data:', error);
    // Don't fail the main operation if sync fails
  }
}

/**
 * Sync preferences data to user preferences
 * @param {string} userId User ID
 * @param {Object} preferencesData Preferences data
 */
async function syncPreferencesData(userId, preferencesData) {
  try {
    // Get current user preferences
    const getParams = {
      TableName: process.env.USERS_TABLE,
      Key: { id: userId },
      ProjectionExpression: 'id, preferences'
    };

    const { Item: user } = await dynamoDB.get(getParams).promise();
    
    if (!user) return;
    
    // Update user preferences
    const currentPreferences = user.preferences || {};
    const updatedPreferences = {
      ...currentPreferences,
      interface: {
        ...currentPreferences.interface,
        showTips: preferencesData.showTips
      },
      notifications: {
        ...currentPreferences.notifications,
        email: {
          ...currentPreferences.notifications?.email,
          marketingContent: preferencesData.enableEmailUpdates
        }
      }
    };
    
    const updateParams = {
      TableName: process.env.USERS_TABLE,
      Key: { id: userId },
      UpdateExpression: 'SET preferences = :preferences, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':preferences': updatedPreferences,
        ':updatedAt': new Date().toISOString()
      }
    };

    await dynamoDB.update(updateParams).promise();
  } catch (error) {
    console.error('Error syncing preferences data:', error);
    // Don't fail the main operation if sync fails
  }
}

/**
 * Trigger onboarding completion event
 * @param {string} userId User ID
 * @param {Object} onboarding Onboarding state
 */
async function triggerOnboardingComplete(userId, onboarding) {
  try {
    console.log(`Onboarding completed for user ${userId}`);
    
    // In a real implementation, this would publish an event to AWS EventBridge
    // to trigger downstream processes like welcome emails, etc.
    
    // Example:
    // const eventBridge = new AWS.EventBridge();
    // await eventBridge.putEvents({
    //   Entries: [{
    //     Source: 'onboarding-service',
    //     DetailType: 'OnboardingCompleted',
    //     Detail: JSON.stringify({
    //       userId,
    //       completedAt: onboarding.completedAt,
    //       profile: onboarding.profile
    //     })
    //   }]
    // }).promise();
  } catch (error) {
    console.error('Error triggering onboarding complete event:', error);
    // Don't fail the main operation if trigger fails
  }
}