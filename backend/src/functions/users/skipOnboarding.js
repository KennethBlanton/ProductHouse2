// backend/src/functions/users/skipOnboarding.js
const AWS = require('aws-sdk');
const { initializeOnboarding } = require('../../models/userOnboarding');

const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * Skip user onboarding process
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

    // Get user to check if exists and get current onboarding state
    const getParams = {
      TableName: process.env.USERS_TABLE,
      Key: { id: userId },
      ProjectionExpression: 'id, onboarding, firstName, lastName'
    };

    const { Item: user } = await dynamoDB.get(getParams).promise();

    if (!user) {
      return {
        statusCode: 404,
        body: JSON.stringify({ 
          message: 'User not found' 
        })
      };
    }

    // Initialize onboarding if it doesn't exist
    const onboarding = user.onboarding || initializeOnboarding({
      firstName: user.firstName || '',
      lastName: user.lastName || ''
    });
    
    // Mark all required steps as complete
    const completedOnboarding = {
      ...onboarding,
      isComplete: true,
      completedAt: new Date().toISOString(),
      progress: 100,
      steps: Object.keys(onboarding.steps).reduce((acc, step) => {
        acc[step] = {
          ...onboarding.steps[step],
          isComplete: true,
          completedAt: new Date().toISOString()
        };
        return acc;
      }, {})
    };

    // Update onboarding state in DynamoDB
    const updateParams = {
      TableName: process.env.USERS_TABLE,
      Key: { id: userId },
      UpdateExpression: 'SET onboarding = :onboarding, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':onboarding': completedOnboarding,
        ':updatedAt': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    };

    const { Attributes: updatedUser } = await dynamoDB.update(updateParams).promise();
    
    // Log onboarding skipped
    console.log(`Onboarding skipped for user ${userId}`);
    
    // Trigger onboarding completed event for downstream processes
    await triggerOnboardingComplete(userId, completedOnboarding);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Onboarding process skipped successfully',
        userId: updatedUser.id,
        onboarding: updatedUser.onboarding
      })
    };
  } catch (error) {
    console.error('Error skipping onboarding:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Failed to skip onboarding',
        error: error.message 
      })
    };
  }
};

/**
 * Trigger onboarding completion event
 * @param {string} userId User ID
 * @param {Object} onboarding Onboarding state
 */
async function triggerOnboardingComplete(userId, onboarding) {
  try {
    console.log(`Onboarding completed (skipped) for user ${userId}`);
    
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
    //       skipped: true
    //     })
    //   }]
    // }).promise();
  } catch (error) {
    console.error('Error triggering onboarding complete event:', error);
    // Don't fail the main operation if trigger fails
  }
}