// backend/src/functions/users/updateUserSettings.js
const AWS = require('aws-sdk');
const { 
  validateSettings, 
  mergeWithDefaults,
  DEFAULT_USER_SETTINGS
} = require('../../models/userSettings');
const { checkPermissions } = require('../../middleware/permissions');

const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * Update user settings
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

    // Check permissions if updating another user's settings
    if (userId !== currentUserId) {
      const hasPermission = await checkPermissions(currentUserId, 'user:update', userId);
      if (!hasPermission) {
        return {
          statusCode: 403,
          body: JSON.stringify({ 
            message: 'Insufficient permissions to update this user\'s settings' 
          })
        };
      }
    }

    // Check if updating a specific section
    const { section } = event.queryStringParameters || {};
    const requestBody = JSON.parse(event.body);
    
    let settingsToUpdate = {};
    
    if (section) {
      // Updating specific section
      if (!DEFAULT_USER_SETTINGS[section]) {
        return {
          statusCode: 400,
          body: JSON.stringify({ 
            message: `Invalid settings section: ${section}`,
            validSections: Object.keys(DEFAULT_USER_SETTINGS)
          })
        };
      }
      
      if (!requestBody[section] || typeof requestBody[section] !== 'object') {
        return {
          statusCode: 400,
          body: JSON.stringify({ 
            message: `Settings update must contain ${section} object` 
          })
        };
      }
      
      settingsToUpdate = { [section]: requestBody[section] };
    } else {
      // Updating multiple sections
      settingsToUpdate = requestBody;
      
      if (!settingsToUpdate || typeof settingsToUpdate !== 'object') {
        return {
          statusCode: 400,
          body: JSON.stringify({ 
            message: 'Valid settings object is required' 
          })
        };
      }
    }

    // Validate settings
    const validation = validateSettings(settingsToUpdate);
    
    if (!validation.isValid) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          message: 'Invalid settings',
          errors: validation.errors
        })
      };
    }

    // Get current user to check if exists and get current settings
    const getParams = {
      TableName: process.env.USERS_TABLE,
      Key: { id: userId },
      ProjectionExpression: 'id, settings, role'
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

    // Check for protected settings that require elevated permissions
    const userRole = user.role || 'user';
    if (hasProtectedSettings(settingsToUpdate) && userRole !== 'admin' && userId !== currentUserId) {
      return {
        statusCode: 403,
        body: JSON.stringify({ 
          message: 'Cannot update protected settings without admin permissions' 
        })
      };
    }

    // Prepare update parameters
    let updateExpression, expressionAttributeValues, expressionAttributeNames;

    if (section) {
      // Update specific section
      updateExpression = 'SET settings.#section = :sectionValue, updatedAt = :updatedAt';
      expressionAttributeValues = {
        ':sectionValue': settingsToUpdate[section],
        ':updatedAt': new Date().toISOString()
      };
      expressionAttributeNames = {
        '#section': section
      };
    } else {
      // Merge with current settings if they exist
      const currentSettings = user.settings || DEFAULT_USER_SETTINGS;
      const updatedSettings = mergeWithDefaults({
        ...currentSettings,
        ...settingsToUpdate
      });
      
      updateExpression = 'SET settings = :settings, updatedAt = :updatedAt';
      expressionAttributeValues = {
        ':settings': updatedSettings,
        ':updatedAt': new Date().toISOString()
      };
      expressionAttributeNames = {};
    }

    // Update user settings in DynamoDB
    const updateParams = {
      TableName: process.env.USERS_TABLE,
      Key: { id: userId },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: expressionAttributeNames,
      ReturnValues: 'ALL_NEW'
    };

    const { Attributes: updatedUser } = await dynamoDB.update(updateParams).promise();

    // Build response based on whether it was a section update or full settings update
    const responseMessage = section 
      ? `Settings section '${section}' updated successfully`
      : 'Settings updated successfully';
      
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: responseMessage,
        userId: updatedUser.id,
        settings: updatedUser.settings
      })
    };
  } catch (error) {
    console.error('Error updating user settings:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Failed to update user settings',
        error: error.message 
      })
    };
  }
};

/**
 * Check if settings update contains protected fields
 * @param {Object} settings Settings to check
 * @returns {boolean} Has protected settings
 */
function hasProtectedSettings(settings) {
  const PROTECTED_SETTINGS = [
    'subscription',
    'features',
    'subscription.plan',
    'subscription.billingCycle',
    'features.maxProjects',
    'features.maxUsersPerProject',
    'features.advancedPlanning',
    'features.codeGeneration',
    'features.customDomains',
    'features.apiAccess',
    'security.requirePasswordChange'
  ];
  
  // Check top-level keys
  for (const protectedPath of PROTECTED_SETTINGS) {
    const parts = protectedPath.split('.');
    
    // Simple case: top-level key
    if (parts.length === 1 && settings[parts[0]] !== undefined) {
      return true;
    }
    
    // Nested case
    if (parts.length > 1 && 
        settings[parts[0]] && 
        settings[parts[0]][parts[1]] !== undefined) {
      return true;
    }
  }
  
  return false;
}