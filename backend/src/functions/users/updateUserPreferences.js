// backend/src/functions/users/updateUserPreferences.js
const AWS = require('aws-sdk');
const { 
  validatePreferences, 
  mergeWithDefaults,
  DEFAULT_USER_PREFERENCES
} = require('../../models/userPreferences');

const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * Update user preferences
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

    // Parse preferences from request body
    const { preferences } = JSON.parse(event.body);
    
    if (!preferences || typeof preferences !== 'object') {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          message: 'Valid preferences object is required' 
        })
      };
    }

    // Validate preferences
    const validation = validatePreferences(preferences);
    
    if (!validation.isValid) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          message: 'Invalid preferences',
          errors: validation.errors
        })
      };
    }

    // Get current user to check if exists
    const getParams = {
      TableName: process.env.USERS_TABLE,
      Key: { id: userId },
      ProjectionExpression: 'id, preferences'
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

    // Merge new preferences with existing ones
    const currentPreferences = user.preferences || DEFAULT_USER_PREFERENCES;
    const updatedPreferences = mergeWithDefaults({
      ...currentPreferences,
      ...preferences
    });

    // Update user preferences in DynamoDB
    const updateParams = {
      TableName: process.env.USERS_TABLE,
      Key: { id: userId },
      UpdateExpression: 'SET preferences = :preferences, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':preferences': updatedPreferences,
        ':updatedAt': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    };

    const { Attributes: updatedUser } = await dynamoDB.update(updateParams).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Preferences updated successfully',
        userId: updatedUser.id,
        preferences: updatedUser.preferences
      })
    };
  } catch (error) {
    console.error('Error updating user preferences:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Failed to update user preferences',
        error: error.message 
      })
    };
  }
};