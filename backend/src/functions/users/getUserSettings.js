// backend/src/functions/users/getUserSettings.js
const AWS = require('aws-sdk');
const { DEFAULT_USER_SETTINGS } = require('../../models/userSettings');

const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * Get user settings
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

    // Check if a specific settings section is requested
    const { section } = event.queryStringParameters || {};

    // Get user from DynamoDB
    const params = {
      TableName: process.env.USERS_TABLE,
      Key: { id: userId },
      ProjectionExpression: 'id, settings'
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

    // Get settings or use defaults if not set
    const settings = user.settings || DEFAULT_USER_SETTINGS;

    // Return specific section if requested
    if (section) {
      if (!settings[section]) {
        return {
          statusCode: 400,
          body: JSON.stringify({ 
            message: `Invalid settings section: ${section}`,
            validSections: Object.keys(DEFAULT_USER_SETTINGS)
          })
        };
      }

      return {
        statusCode: 200,
        body: JSON.stringify({
          userId: user.id,
          [section]: settings[section]
        })
      };
    }

    // Return all settings
    return {
      statusCode: 200,
      body: JSON.stringify({
        userId: user.id,
        settings
      })
    };
  } catch (error) {
    console.error('Error retrieving user settings:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Failed to retrieve user settings',
        error: error.message 
      })
    };
  }
};