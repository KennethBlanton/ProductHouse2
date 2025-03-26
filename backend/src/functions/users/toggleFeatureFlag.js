// backend/src/functions/users/toggleFeatureFlags.js
const AWS = require('aws-sdk');
const { checkPermissions } = require('../../middleware/permissions');

const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * Toggle feature flags for a user
 * @param {Object} event Lambda event object
 * @returns {Object} Lambda response
 */
exports.handler = async (event) => {
  try {
    // Extract user ID from path parameters or cognito sub
    const userId = event.pathParameters?.userId || 
                  event.requestContext?.authorizer?.claims?.sub;
    const currentUserId = event.requestContext?.authorizer?.claims?.sub;

    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          message: 'User ID is required' 
        })
      };
    }

    // Parse feature flags from request
    const { features } = JSON.parse(event.body);
    
    if (!features || typeof features !== 'object') {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          message: 'Valid features object is required' 
        })
      };
    }

    // Check permissions - only admins can toggle protected features
    // Regular users can only toggle their own non-protected features
    const isAdmin = await checkPermissions(currentUserId, 'admin:features');
    
    if (!isAdmin && userId !== currentUserId) {
      return {
        statusCode: 403,
        body: JSON.stringify({ 
          message: 'Insufficient permissions to update features for this user' 
        })
      };
    }

    // Check for protected features if not admin
    if (!isAdmin && hasProtectedFeatures(features)) {
      return {
        statusCode: 403,
        body: JSON.stringify({ 
          message: 'Cannot update protected features without admin permissions',
          protectedFeatures: PROTECTED_FEATURES
        })
      };
    }

    // Get current user to check if exists
    const getParams = {
      TableName: process.env.USERS_TABLE,
      Key: { id: userId },
      ProjectionExpression: 'id, settings'
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

    // Ensure settings and features exist
    const currentSettings = user.settings || {};
    const currentFeatures = currentSettings.features || {};
    
    // Validate feature updates
    const validationErrors = validateFeatureUpdates(features, currentFeatures, isAdmin);
    
    if (validationErrors.length > 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Invalid feature updates',
          errors: validationErrors
        })
      };
    }

    // Merge with current features
    const updatedFeatures = {
      ...currentFeatures,
      ...features
    };
    
    // Update features in DynamoDB
    const updateParams = {
      TableName: process.env.USERS_TABLE,
      Key: { id: userId },
      UpdateExpression: 'SET settings.features = :features, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':features': updatedFeatures,
        ':updatedAt': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    };

    const { Attributes: updatedUser } = await dynamoDB.update(updateParams).promise();

    // Record feature flag changes for analytics
    await recordFeatureFlagChanges(userId, currentFeatures, updatedFeatures, currentUserId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Features updated successfully',
        userId: updatedUser.id,
        features: updatedUser.settings.features
      })
    };
  } catch (error) {
    console.error('Error updating features:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Failed to update features',
        error: error.message 
      })
    };
  }
};

// List of protected features that only admins can modify
const PROTECTED_FEATURES = [
  'maxProjects',
  'maxUsersPerProject',
  'advancedPlanning',
  'codeGeneration',
  'customDomains',
  'apiAccess',
  'prioritySupport'
];

/**
 * Check if feature update contains protected features
 * @param {Object} features Features to check
 * @returns {boolean} Has protected features
 */
function hasProtectedFeatures(features) {
  return PROTECTED_FEATURES.some(feature => 
    features[feature] !== undefined || 
    (features.integrations && features.integrations[feature] !== undefined)
  );
}

/**
 * Validate feature updates
 * @param {Object} features New features
 * @param {Object} currentFeatures Current features
 * @param {boolean} isAdmin Is admin user
 * @returns {string[]} Validation errors
 */
function validateFeatureUpdates(features, currentFeatures, isAdmin) {
  const errors = [];
  
  // Validate numeric values
  if (features.maxProjects !== undefined) {
    const maxProjects = parseInt(features.maxProjects);
    if (isNaN(maxProjects) || maxProjects < 0) {
      errors.push('maxProjects must be a non-negative number');
    }
  }
  
  if (features.maxUsersPerProject !== undefined) {
    const maxUsers = parseInt(features.maxUsersPerProject);
    if (isNaN(maxUsers) || maxUsers < 0) {
      errors.push('maxUsersPerProject must be a non-negative number');
    }
  }
  
  // Check boolean values
  const booleanFeatures = [
    'advancedPlanning', 
    'codeGeneration', 
    'customDomains', 
    'apiAccess', 
    'prioritySupport'
  ];
  
  booleanFeatures.forEach(feature => {
    if (features[feature] !== undefined && typeof features[feature] !== 'boolean') {
      errors.push(`${feature} must be a boolean value`);
    }
  });
  
  // Check integrations
  if (features.integrations) {
    const integrationServices = ['github', 'jira', 'trello', 'asana'];
    
    integrationServices.forEach(service => {
      if (features.integrations[service] !== undefined && 
          typeof features.integrations[service] !== 'boolean') {
        errors.push(`integrations.${service} must be a boolean value`);
      }
    });
  }
  
  return errors;
}

/**
 * Record feature flag changes for analytics
 * @param {string} userId User ID
 * @param {Object} oldFeatures Old features
 * @param {Object} newFeatures New features
 * @param {string} updatedBy User ID who made the update
 */
async function recordFeatureFlagChanges(userId, oldFeatures, newFeatures, updatedBy) {
  try {
    // In a real implementation, this would record changes to a tracking system
    const changes = [];
    
    // Compare all properties in newFeatures
    Object.keys(newFeatures).forEach(key => {
      if (JSON.stringify(oldFeatures[key]) !== JSON.stringify(newFeatures[key])) {
        changes.push({
          feature: key,
          oldValue: oldFeatures[key],
          newValue: newFeatures[key]
        });
      }
    });
    
    if (changes.length > 0) {
      console.log(`Feature changes for user ${userId} by ${updatedBy}:`, JSON.stringify(changes));
      
      // Record the changes to analytics/audit system
      // Normally you would send this to a separate service
      const changeRecord = {
        userId,
        updatedBy,
        timestamp: new Date().toISOString(),
        changes
      };
      
      // Example: Log to CloudWatch
      console.log('Feature flag change record:', JSON.stringify(changeRecord));
      
      // Example: Store in DynamoDB audit table
      // await dynamoDB.put({
      //   TableName: process.env.AUDIT_LOG_TABLE,
      //   Item: changeRecord
      // }).promise();
    }
  } catch (error) {
    console.error('Error recording feature flag changes:', error);
    // Don't fail the main operation if analytics recording fails
  }
}