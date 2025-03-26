// backend/src/functions/users/updateUserProfile.js
const AWS = require('aws-sdk');

const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    // Extract user ID from path parameters or cognito sub
    const userId = event.pathParameters?.userId || 
                   event.requestContext?.authorizer?.claims?.sub;

    // Parse input from the event body
    const { 
      firstName, 
      lastName, 
      preferences 
    } = JSON.parse(event.body);

    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          message: 'User ID is required' 
        })
      };
    }

    // Prepare update expression and attribute values
    const updateExpression = [];
    const expressionAttributeValues = {};
    const expressionAttributeNames = {};

    if (firstName !== undefined) {
      updateExpression.push('#firstName = :firstName');
      expressionAttributeNames['#firstName'] = 'firstName';
      expressionAttributeValues[':firstName'] = firstName;
    }

    if (lastName !== undefined) {
      updateExpression.push('#lastName = :lastName');
      expressionAttributeNames['#lastName'] = 'lastName';
      expressionAttributeValues[':lastName'] = lastName;
    }

    if (preferences !== undefined) {
      updateExpression.push('#preferences = :preferences');
      expressionAttributeNames['#preferences'] = 'preferences';
      expressionAttributeValues[':preferences'] = preferences;
    }

    // Add updated timestamp
    updateExpression.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    // Construct update params
    const params = {
      TableName: process.env.USERS_TABLE,
      Key: { id: userId },
      UpdateExpression: 'SET ' + updateExpression.join(', '),
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    };

    // Perform update
    const { Attributes: updatedUser } = await dynamoDB.update(params).promise();

    if (!updatedUser) {
      return {
        statusCode: 404,
        body: JSON.stringify({ 
          message: 'User profile not found' 
        })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Profile updated successfully',
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          preferences: updatedUser.preferences
        }
      })
    };
  } catch (error) {
    console.error('Error updating user profile:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Internal server error',
        error: error.message 
      })
    };
  }
};