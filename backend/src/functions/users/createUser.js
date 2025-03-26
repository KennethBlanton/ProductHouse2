// backend/src/functions/users/createUser.js
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    // Parse input from the event
    const { 
      username, 
      email, 
      firstName, 
      lastName,
      cognitoSub 
    } = JSON.parse(event.body);

    // Validate input
    if (!username || !email || !cognitoSub) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          message: 'Missing required fields' 
        })
      };
    }

    // Prepare user data
    const userItem = {
      id: cognitoSub, // Use Cognito Sub as primary key
      username,
      email,
      firstName: firstName || '',
      lastName: lastName || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active',
      preferences: {
        emailNotifications: true,
        darkMode: false
      }
    };

    // Save user to DynamoDB
    const params = {
      TableName: process.env.USERS_TABLE,
      Item: userItem,
      ConditionExpression: 'attribute_not_exists(id)'
    };

    await dynamoDB.put(params).promise();

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: 'User created successfully',
        user: {
          id: userItem.id,
          username: userItem.username,
          email: userItem.email,
          firstName: userItem.firstName,
          lastName: userItem.lastName
        }
      })
    };
  } catch (error) {
    console.error('Error creating user:', error);

    // Handle specific error cases
    if (error.code === 'ConditionalCheckFailedException') {
      return {
        statusCode: 409,
        body: JSON.stringify({ 
          message: 'User already exists' 
        })
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Internal server error',
        error: error.message 
      })
    };
  }
};