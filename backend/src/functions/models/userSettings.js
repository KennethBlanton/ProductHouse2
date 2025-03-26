// backend/src/models/userSettings.js
const DEFAULT_USER_SETTINGS = {
    // Account settings
    account: {
      email: '', // Will be populated from user's actual email
      emailVerified: false,
      name: {
        firstName: '',
        lastName: ''
      },
      timezone: 'UTC',
      language: 'en-US',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h' // 12h or 24h
    },
    
    // Security settings
    security: {
      mfaEnabled: false,
      mfaMethod: 'none', // none, totp, sms
      passwordLastChanged: null, // ISO date string
      requirePasswordChange: false,
      loginNotifications: true,
      trustedDevices: [] // list of device IDs
    },
    
    // Subscription and billing
    subscription: {
      plan: 'free', // free, pro, team, enterprise
      billingCycle: 'monthly', // monthly, yearly
      autoRenew: true,
      paymentMethod: null,
      trialEndsAt: null, // ISO date string
      subscriptionEndsAt: null // ISO date string
    },
    
    // Feature access
    features: {
      maxProjects: 5,
      maxUsersPerProject: 1,
      advancedPlanning: false,
      codeGeneration: false,
      integrations: {
        github: false,
        jira: false,
        trello: false,
        asana: false
      },
      customDomains: false,
      apiAccess: false,
      prioritySupport: false
    },
    
    // Notifications
    notifications: {
      channels: {
        email: true,
        browser: true,
        mobile: false
      },
      digestFrequency: 'daily', // daily, weekly, none
      digestDay: 1, // 1-7 for weekly digests (Monday = 1)
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      }
    },
    
    // Privacy settings
    privacy: {
      shareUsageData: true,
      allowFeedbackRequests: true,
      showProfileToOthers: true,
      activityVisible: true
    },
    
    // Integration settings
    integrations: {
      connectedAccounts: {
        github: null,
        google: null,
        slack: null
      },
      apiKeys: [] // Will contain API key metadata, not actual keys
    }
  };
  
  /**
   * Validate user settings against the schema
   * @param {Object} settings User settings to validate
   * @returns {Object} Validation result with isValid flag and errors array
   */
  function validateSettings(settings) {
    const errors = [];
    
    // Helper function to validate settings sections
    function validateSection(section, schema, path = '') {
      if (!section) return;
      
      // Check for unexpected properties
      Object.keys(section).forEach(key => {
        const currentPath = path ? `${path}.${key}` : key;
        
        if (!schema[key] && !DYNAMIC_FIELDS[currentPath]) {
          errors.push(`Unexpected property: ${currentPath}`);
          return;
        }
        
        const value = section[key];
        const schemaValue = schema[key];
        
        // Skip validation for dynamic fields
        if (DYNAMIC_FIELDS[currentPath]) {
          return;
        }
        
        // Recursive validation for nested objects
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          validateSection(value, schemaValue, currentPath);
        } else {
          // Validate value types and ranges
          if (typeof value !== typeof schemaValue && 
              !(schemaValue === null && value === null)) {
            errors.push(`Invalid type for ${currentPath}: expected ${typeof schemaValue}, got ${typeof value}`);
          } else if (typeof value === 'string' && 
                    Array.isArray(ENUM_VALUES[currentPath]) && 
                    !ENUM_VALUES[currentPath].includes(value)) {
            errors.push(`Invalid value for ${currentPath}: must be one of ${ENUM_VALUES[currentPath].join(', ')}`);
          }
        }
      });
    }
    
    // Validate each top-level section
    Object.keys(settings).forEach(section => {
      if (DEFAULT_USER_SETTINGS[section]) {
        validateSection(settings[section], DEFAULT_USER_SETTINGS[section], section);
      } else {
        errors.push(`Unexpected section: ${section}`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  // Fields that can have dynamic content
  const DYNAMIC_FIELDS = {
    'security.trustedDevices': true,
    'integrations.apiKeys': true,
    'integrations.connectedAccounts.github': true,
    'integrations.connectedAccounts.google': true,
    'integrations.connectedAccounts.slack': true
  };
  
  // Enum values for string settings
  const ENUM_VALUES = {
    'account.language': ['en-US', 'es-ES', 'fr-FR', 'de-DE', 'it-IT', 'pt-BR', 'ru-RU', 'zh-CN', 'ja-JP'],
    'account.timeFormat': ['12h', '24h'],
    'security.mfaMethod': ['none', 'totp', 'sms'],
    'subscription.plan': ['free', 'pro', 'team', 'enterprise'],
    'subscription.billingCycle': ['monthly', 'yearly'],
    'notifications.digestFrequency': ['daily', 'weekly', 'none']
  };
  
  /**
   * Merge provided settings with defaults
   * @param {Object} settings User settings to merge
   * @returns {Object} Merged settings
   */
  function mergeWithDefaults(settings) {
    return deepMerge({}, DEFAULT_USER_SETTINGS, settings);
  }
  
  /**
   * Deep merge utility function
   * @param {Object} target Target object
   * @param {...Object} sources Source objects
   * @returns {Object} Merged object
   */
  function deepMerge(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();
  
    if (isObject(target) && isObject(source)) {
      for (const key in source) {
        if (isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          deepMerge(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }
  
    return deepMerge(target, ...sources);
  }
  
  /**
   * Check if value is an object
   * @param {*} item Value to check
   * @returns {boolean} Is object
   */
  function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
  }
  
  /**
   * Initialize default settings for a new user
   * @param {Object} userData Basic user data (email, name, etc.)
   * @returns {Object} Initialized settings
   */
  function initializeSettings(userData = {}) {
    const settings = JSON.parse(JSON.stringify(DEFAULT_USER_SETTINGS));
    
    // Populate with user data if available
    if (userData.email) {
      settings.account.email = userData.email;
    }
    
    if (userData.firstName) {
      settings.account.name.firstName = userData.firstName;
    }
    
    if (userData.lastName) {
      settings.account.name.lastName = userData.lastName;
    }
    
    return settings;
  }
  
  module.exports = {
    DEFAULT_USER_SETTINGS,
    validateSettings,
    mergeWithDefaults,
    initializeSettings
  };