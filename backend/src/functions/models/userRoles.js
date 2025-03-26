// backend/src/models/userRoles.js
/**
 * User role definitions with corresponding permissions
 */
const USER_ROLES = {
    // Base user role with limited permissions
    'user': {
      description: 'Standard user with basic permissions',
      permissions: [
        'user:read:self',
        'user:update:self',
        'preferences:read:self',
        'preferences:update:self',
        'settings:read:self',
        'settings:update:self',
        'project:create',
        'project:read:own',
        'project:update:own',
        'project:delete:own',
        'plan:create:own',
        'plan:read:own',
        'plan:update:own',
        'plan:delete:own',
        'conversation:create:own',
        'conversation:read:own',
        'conversation:update:own'
      ],
      limits: {
        maxProjects: 5,
        maxCollaboratorsPerProject: 1,
        maxStorageGb: 1
      }
    },
    
    // Pro user with enhanced permissions
    'pro': {
      description: 'Pro user with enhanced capabilities',
      inheritsFrom: 'user',
      permissions: [
        'api:access',
        'integration:github',
        'integration:jira',
        'integration:trello',
        'feature:advancedPlanning',
        'feature:codeGeneration'
      ],
      limits: {
        maxProjects: 20,
        maxCollaboratorsPerProject: 5,
        maxStorageGb: 10
      }
    },
    
    // Team user with collaboration permissions
    'team': {
      description: 'Team user with collaboration capabilities',
      inheritsFrom: 'pro',
      permissions: [
        'user:list:team',
        'project:share',
        'project:read:shared',
        'project:update:shared',
        'plan:read:shared',
        'plan:update:shared',
        'conversation:read:shared'
      ],
      limits: {
        maxProjects: 50,
        maxCollaboratorsPerProject: 10,
        maxStorageGb: 50
      }
    },
    
    // Team admin with team management permissions
    'team_admin': {
      description: 'Team administrator with management capabilities',
      inheritsFrom: 'team',
      permissions: [
        'team:manage',
        'user:invite',
        'user:disable:team',
        'user:read:team',
        'billing:view',
        'billing:update'
      ],
      limits: {
        maxProjects: 100,
        maxCollaboratorsPerProject: 20,
        maxStorageGb: 100
      }
    },
    
    // System admin with full permissions
    'admin': {
      description: 'System administrator with full access',
      permissions: [
        'admin:full',
        'user:*',
        'project:*',
        'plan:*',
        'conversation:*',
        'settings:*',
        'preferences:*',
        'billing:*',
        'team:*',
        'integration:*',
        'feature:*',
        'api:*',
        'logs:*',
        'system:*'
      ],
      limits: {
        maxProjects: -1, // unlimited
        maxCollaboratorsPerProject: -1, // unlimited
        maxStorageGb: -1 // unlimited
      }
    }
  };
  
  /**
   * Resolve all permissions for a role including inherited permissions
   * @param {string} roleName Role name
   * @returns {string[]} Array of permission strings
   */
  function resolveRolePermissions(roleName) {
    const role = USER_ROLES[roleName];
    if (!role) {
      return [];
    }
    
    // Start with role's own permissions
    let permissions = [...role.permissions];
    
    // Add inherited permissions
    if (role.inheritsFrom && USER_ROLES[role.inheritsFrom]) {
      const inheritedPermissions = resolveRolePermissions(role.inheritsFrom);
      permissions = [...permissions, ...inheritedPermissions];
    }
    
    // Return unique permissions
    return [...new Set(permissions)];
  }
  
  /**
   * Check if a permission matches a required permission pattern
   * @param {string} userPermission Permission to check
   * @param {string} requiredPermission Required permission pattern (may include wildcards)
   * @returns {boolean} Does the permission match
   */
  function doesPermissionMatch(userPermission, requiredPermission) {
    // Exact match
    if (userPermission === requiredPermission) {
      return true;
    }
    
    // Wildcard in user permission
    if (userPermission.includes(':*')) {
      const userBase = userPermission.split(':*')[0];
      const requiredBase = requiredPermission.split(':')[0];
      
      if (userBase === requiredBase) {
        return true;
      }
    }
    
    // Full wildcard
    if (userPermission === '*') {
      return true;
    }
    
    return false;
  }
  
  /**
   * Check if a user has a specific permission
   * @param {string[]} userPermissions User's permissions
   * @param {string} requiredPermission Required permission
   * @returns {boolean} Does the user have the permission
   */
  function hasPermission(userPermissions, requiredPermission) {
    return userPermissions.some(perm => doesPermissionMatch(perm, requiredPermission));
  }
  
  /**
   * Get user limits based on role
   * @param {string} roleName Role name
   * @returns {Object} Limits object
   */
  function getRoleLimits(roleName) {
    const role = USER_ROLES[roleName];
    if (!role) {
      return USER_ROLES.user.limits; // Default to basic user limits
    }
    
    return role.limits;
  }
  
  module.exports = {
    USER_ROLES,
    resolveRolePermissions,
    hasPermission,
    getRoleLimits
  };