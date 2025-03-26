// backend/src/functions/users/manageNotificationSettings.js
const AWS = require('aws-sdk');
const { validateSettings } = require('../../models/userSettings');

const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * Manage user notification settings
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

    // Parse notification settings from request
    const { notifications } = JSON.parse(event.body);
    
    if (!notifications || typeof notifications !== 'object') {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          message: 'Valid notifications object is required' 
        })
      };
    }

    // Validate notification settings
    const validation = validateSettings({ notifications });
    
    if (!validation.isValid) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          message: 'Invalid notification settings',
          errors: validation.errors
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

    // Update notification settings in DynamoDB
    const updateParams = {
      TableName: process.env.USERS_TABLE,
      Key: { id: userId },
      UpdateExpression: 'SET settings.notifications = :notifications, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':notifications': notifications,
        ':updatedAt': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    };

    const { Attributes: updatedUser } = await dynamoDB.update(updateParams).promise();

    // Check if we need to update external notification services
    await syncExternalNotificationSettings(userId, notifications);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Notification settings updated successfully',
        userId: updatedUser.id,
        notifications: updatedUser.settings.notifications
      })
    };
  } catch (error) {
    console.error('Error updating notification settings:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Failed to update notification settings',
        error: error.message 
      })
    };
  }
};

/**
 * Sync notification settings with external services
 * @param {string} userId User ID
 * @param {Object} notifications Notification settings
 */
async function syncExternalNotificationSettings(userId, notifications) {
  try {
    // In a real implementation, this would update external notification services
    // such as push notification services, email preferences, etc.
    
    // Example: Update email subscription status
    if (notifications.channels && notifications.channels.email !== undefined) {
      console.log(`Updating email subscription status for user ${userId} to ${notifications.channels.email}`);
      // await emailService.updateSubscription(userId, notifications.channels.email);
    }
    
    // Example: Update mobile push notification settings
    if (notifications.channels && notifications.channels.mobile !== undefined) {
      console.log(`Updating mobile push notification status for user ${userId} to ${notifications.channels.mobile}`);
      // await pushService.updateUserPreference(userId, notifications.channels.mobile);
    }
    
    // Example: Update digest frequency settings
    if (notifications.digestFrequency) {
      console.log(`Updating digest frequency for user ${userId} to ${notifications.digestFrequency}`);
      // await digestService.updateFrequency(userId, notifications.digestFrequency, notifications.digestDay);
    }
  } catch (error) {
    console.error('Error syncing external notification settings:', error);
    // We don't want to fail the main operation if external syncing fails
    // Just log the error and continue
  }
}