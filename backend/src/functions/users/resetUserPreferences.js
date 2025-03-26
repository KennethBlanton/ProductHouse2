// backend/src/functions/users/resetUserPreferences.js
const AWS = require('aws-sdk');
const { DEFAULT_USER_PREFERENCES } = require('../../models/userPreferences');

const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * Reset user preferences to default
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

    // Check if it's a section reset or full reset
    const { section } = event.queryStringParameters || {};
    let resetExpression, resetValues, resetExpressionAttrs;

    if (section && DEFAULT_USER_PREFERENCES[section]) {
      // Reset specific section
      resetExpression = 'SET preferences.#section = :sectionDefaults, updatedAt = :updatedAt';
      resetValues = {
        ':sectionDefaults': DEFAULT_USER_PREFERENCES[section],
        ':updatedAt': new Date().toISOString()
      };
      resetExpressionAttrs = {
        '#section': section
      };
    } else if (section) {
      // Invalid section
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          message: `Invalid preference section: ${section}`,
          validSections: Object.keys(DEFAULT_USER_PREFERENCES)
        })
      };
    } else {
      // Reset all preferences
      resetExpression = 'SET preferences = :defaults, updatedAt = :updatedAt';
      resetValues = {
        ':defaults': DEFAULT_USER_PREFERENCES,
        ':updatedAt': new Date().toISOString()
      };
      resetExpressionAttrs = {};
    }

    // Check if user exists
    const getParams = {
      TableName: process.env.USERS_TABLE,
      Key: { id: userId },
      ProjectionExpression: 'id'
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
    
    // Reset preferences in DynamoDB
    const updateParams = {
      TableName: process.env.USERS_TABLE,
      Key: { id: userId },
      UpdateExpression: resetExpression,
      ExpressionAttributeValues: resetValues,
      ExpressionAttributeNames: resetExpressionAttrs,
      ReturnValues: 'ALL_NEW'
    };
    
    const { Attributes: updatedUser } = await dynamoDB.update(updateParams).promise();
    
    // Build response based on whether it was a section reset or full reset
    const responseMessage = section 
      ? `Preferences section '${section}' reset to defaults`
      : 'All preferences reset to defaults';
      
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: responseMessage,
        userId: updatedUser.id,
        preferences: updatedUser.preferences
      })
    };
  } catch (error) {
    console.error('Error resetting user preferences:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Failed to reset user preferences',
        error: error.message 
      })
    };
  }
};