// backend/src/middleware/permissions.js
const AWS = require('aws-sdk');
const { 
  resolveRolePermissions, 
  hasPermission 
} = require('../models/userRoles');

const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * Check if a user has permission to perform an action
 * @param {string} userId User ID
 * @param {string} requiredPermission Required permission
 * @param {string|Object} resourceId Optional resource ID or object with resource details
 * @returns {Promise<boolean>} Whether the user has permission
 */
async function checkPermissions(userId, requiredPermission, resourceId) {
  if (!userId) {
    return false;
  }
  
  try {
    // Get user from DynamoDB
    const params = {
      TableName: process.env.USERS_TABLE,
      Key: { id: userId },
      ProjectionExpression: 'id, role, ownedResources, sharedResources'
    };
    
    const { Item: user } = await dynamoDB.get(params).promise();
    
    if (!user) {
      return false;
    }
    
    // Get all permissions for the user's role
    const role = user.role || 'user'; // Default to basic user role
    const permissions = resolveRolePermissions(role);
    
    // Check if permission matches without considering resource ownership
    if (hasPermission(permissions, requiredPermission)) {
      return true;
    }
    
    // If no specific resource, permission is denied
    if (!resourceId) {
      return false;
    }
    
    // Check resource-specific permissions
    
    // Extract permission parts
    const [resource, action, scope] = requiredPermission.split(':');
    
    // Handle self-scoped permissions
    if (scope === 'self' && resourceId === userId) {
      return hasPermission(permissions, `${resource}:${action}:self`);
    }
    
    // Handle own-scoped permissions
    if (scope === 'own') {
      // Check if user owns the resource
      const isOwned = user.ownedResources && 
        (Array.isArray(user.ownedResources[resource]) && 
         user.ownedResources[resource].includes(resourceId));
      
      if (isOwned) {
        return hasPermission(permissions, `${resource}:${action}:own`);
      }
    }
    
    // Handle shared-scoped permissions
    if (scope === 'shared') {
      // Check if resource is shared with the user
      const isShared = user.sharedResources && 
        (Array.isArray(user.sharedResources[resource]) && 
         user.sharedResources[resource].includes(resourceId));
      
      if (isShared) {
        return hasPermission(permissions, `${resource}:${action}:shared`);
      }
    }
    
    // Handle team-scoped permissions
    if (scope === 'team') {
      // This would require looking up if users are in the same team
      // For simplicity, not implemented in this example
      return false;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking permissions:', error);
    return false;
  }
}

/**
 * Middleware to check permissions for API Gateway events
 * @param {string} requiredPermission Required permission
 * @param {Function} getResourceId Function to extract resource ID from event
 * @returns {Function} Lambda middleware function
 */
function requirePermission(requiredPermission, getResourceId = null) {
  return {
    before: async (handler) => {
      const { event } = handler;
      
      // Extract user ID from cognito claims
      const userId = event.requestContext?.authorizer?.claims?.sub;
      
      if (!userId) {
        // No authenticated user
        throw new Error('Unauthorized');
      }
      
      // Extract resource ID if function provided
      const resourceId = getResourceId ? getResourceId(event) : null;
      
      // Check permissions
      const hasPermissionResult = await checkPermissions(
        userId, 
        requiredPermission, 
        resourceId
      );
      
      if (!hasPermissionResult) {
        // Permission denied
        throw new Error('Forbidden');
      }
    }
  };
}

/**
 * Add a resource to a user's owned resources
 * @param {string} userId User ID
 * @param {string} resourceType Resource type (e.g., 'project', 'plan')
 * @param {string} resourceId Resource ID
 * @returns {Promise<void>}
 */
async function addOwnedResource(userId, resourceType, resourceId) {
  try {
    // Update user's owned resources in DynamoDB
    const params = {
      TableName: process.env.USERS_TABLE,
      Key: { id: userId },
      UpdateExpression: 'SET ownedResources.#resourceType = list_append(if_not_exists(ownedResources.#resourceType, :empty_list), :resourceId)',
      ExpressionAttributeNames: {
        '#resourceType': resourceType
      },
      ExpressionAttributeValues: {
        ':resourceId': [resourceId],
        ':empty_list': []
      }
    };
    
    await dynamoDB.update(params).promise();
  } catch (error) {
    console.error('Error adding owned resource:', error);
    throw error;
  }
}

/**
 * Share a resource with another user
 * @param {string} ownerId Owner user ID
 * @param {string} targetUserId Target user ID
 * @param {string} resourceType Resource type (e.g., 'project', 'plan')
 * @param {string} resourceId Resource ID
 * @returns {Promise<void>}
 */
async function shareResource(ownerId, targetUserId, resourceType, resourceId) {
  try {
    // Check if owner actually owns the resource
    const ownerParams = {
      TableName: process.env.USERS_TABLE,
      Key: { id: ownerId },
      ProjectionExpression: 'id, ownedResources'
    };
    
    const { Item: owner } = await dynamoDB.get(ownerParams).promise();
    
    if (!owner || 
        !owner.ownedResources || 
        !owner.ownedResources[resourceType] || 
        !owner.ownedResources[resourceType].includes(resourceId)) {
      throw new Error('Not authorized to share this resource');
    }
    
    // Update target user's shared resources in DynamoDB
    const targetParams = {
      TableName: process.env.USERS_TABLE,
      Key: { id: targetUserId },
      UpdateExpression: 'SET sharedResources.#resourceType = list_append(if_not_exists(sharedResources.#resourceType, :empty_list), :resourceId)',
      ExpressionAttributeNames: {
        '#resourceType': resourceType
      },
      ExpressionAttributeValues: {
        ':resourceId': [resourceId],
        ':empty_list': []
      }
    };
    
    await dynamoDB.update(targetParams).promise();
    
    // Log the sharing activity
    console.log(`User ${ownerId} shared ${resourceType} ${resourceId} with user ${targetUserId}`);
  } catch (error) {
    console.error('Error sharing resource:', error);
    throw error;
  }
}

module.exports = {
  checkPermissions,
  requirePermission,
  addOwnedResource,
  shareResource
};