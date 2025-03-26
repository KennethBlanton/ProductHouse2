// backend/src/functions/users/getOnboardingState.js
const AWS = require('aws-sdk');
const { initializeOnboarding } = require('../../models/userOnboarding');

const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * Get user's onboarding state
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

    // Return onboarding state or initialize if not set
    const onboarding = user.onboarding || initializeOnboarding({
      firstName: user.firstName || '',
      lastName: user.lastName || ''
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        userId: user.id,
        onboarding
      })
    };
  } catch (error) {
    console.error('Error retrieving onboarding state:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Failed to retrieve onboarding state',
        error: error.message 
      })
    };
  }
};