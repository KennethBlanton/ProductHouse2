// backend/src/functions/users/getUserPreferences.js
const AWS = require('aws-sdk');
const { DEFAULT_USER_PREFERENCES } = require('../../models/userPreferences');

const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * Get user preferences
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

    // Get user from DynamoDB
    const params = {
      TableName: process.env.USERS_TABLE,
      Key: { id: userId },
      ProjectionExpression: 'id, preferences'
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

    // Return preferences or defaults if not set
    const preferences = user.preferences || DEFAULT_USER_PREFERENCES;

    return {
      statusCode: 200,
      body: JSON.stringify({
        userId: user.id,
        preferences
      })
    };
  } catch (error) {
    console.error('Error retrieving user preferences:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Failed to retrieve user preferences',
        error: error.message 
      })
    };
  }
};