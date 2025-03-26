// backend/src/models/userOnboarding.js
/**
 * Default onboarding state for new users
 */
const DEFAULT_ONBOARDING_STATE = {
    // Overall progress
    isComplete: false,
    completedAt: null,
    currentStep: 'profile',
    progress: 0,
    
    // Steps and their status
    steps: {
      profile: {
        isComplete: false,
        completedAt: null,
        required: true
      },
      preferences: {
        isComplete: false,
        completedAt: null,
        required: true
      },
      projectSetup: {
        isComplete: false,
        completedAt: null,
        required: true
      },
      featureIntro: {
        isComplete: false,
        completedAt: null,
        required: false
      },
      integrations: {
        isComplete: false,
        completedAt: null,
        required: false
      }
    },
    
    // User's profile information (to be completed during onboarding)
    profile: {
      name: {
        firstName: '',
        lastName: ''
      },
      jobTitle: '',
      company: '',
      industry: '',
      teamSize: '',
      experience: '', // beginner, intermediate, advanced
      useCases: [] // array of use cases
    },
    
    // Feature introduction tracking
    features: {
      planGeneration: {
        introduced: false,
        interacted: false
      },
      claudeAssistant: {
        introduced: false,
        interacted: false
      },
      projectManagement: {
        introduced: false,
        interacted: false
      },
      codeGeneration: {
        introduced: false,
        interacted: false
      },
      deployment: {
        introduced: false,
        interacted: false
      }
    },
    
    // Onboarding preferences
    preferences: {
      showTutorials: true,
      showTips: true,
      enableEmailUpdates: true
    }
  };
  
  /**
   * Valid step transition rules
   * Maps from current step to valid next steps
   */
  const STEP_TRANSITIONS = {
    'profile': ['preferences', 'projectSetup'],
    'preferences': ['projectSetup', 'featureIntro'],
    'projectSetup': ['featureIntro', 'integrations'],
    'featureIntro': ['integrations'],
    'integrations': []
  };
  
  /**
   * Initialize onboarding state for a new user
   * @param {Object} userData Optional initial user data
   * @returns {Object} Initialized onboarding state
   */
  function initializeOnboarding(userData = {}) {
    const onboarding = JSON.parse(JSON.stringify(DEFAULT_ONBOARDING_STATE));
    
    // Pre-populate with user data if available
    if (userData.firstName) {
      onboarding.profile.name.firstName = userData.firstName;
    }
    
    if (userData.lastName) {
      onboarding.profile.name.lastName = userData.lastName;
    }
    
    return onboarding;
  }
  
  /**
   * Calculate onboarding progress percentage
   * @param {Object} onboarding Onboarding state
   * @returns {number} Progress percentage (0-100)
   */
  function calculateProgress(onboarding) {
    const steps = onboarding.steps;
    const requiredSteps = Object.values(steps).filter(step => step.required);
    const completedRequiredSteps = requiredSteps.filter(step => step.isComplete);
    
    return Math.round((completedRequiredSteps.length / requiredSteps.length) * 100);
  }
  
  /**
   * Check if onboarding is complete
   * @param {Object} onboarding Onboarding state
   * @returns {boolean} Is onboarding complete
   */
  function isOnboardingComplete(onboarding) {
    const steps = onboarding.steps;
    const requiredSteps = Object.keys(steps).filter(key => steps[key].required);
    
    return requiredSteps.every(key => steps[key].isComplete);
  }
  
  /**
   * Validate a step transition
   * @param {string} currentStep Current step
   * @param {string} nextStep Requested next step
   * @returns {boolean} Is valid transition
   */
  function isValidStepTransition(currentStep, nextStep) {
    return STEP_TRANSITIONS[currentStep]?.includes(nextStep) || false;
  }
  
  /**
   * Get the next recommended step
   * @param {Object} onboarding Onboarding state
   * @returns {string} Next recommended step
   */
  function getNextRecommendedStep(onboarding) {
    const currentStep = onboarding.currentStep;
    const steps = onboarding.steps;
    
    // If current step is not complete, stay on it
    if (!steps[currentStep].isComplete) {
      return currentStep;
    }
    
    // Find the first incomplete required step
    const incompleteRequiredStep = Object.keys(steps)
      .find(key => steps[key].required && !steps[key].isComplete);
    
    if (incompleteRequiredStep) {
      return incompleteRequiredStep;
    }
    
    // If all required steps are complete, find the first incomplete optional step
    const incompleteOptionalStep = Object.keys(steps)
      .find(key => !steps[key].required && !steps[key].isComplete);
    
    if (incompleteOptionalStep) {
      return incompleteOptionalStep;
    }
    
    // If everything is complete, return the last step
    return Object.keys(steps)[Object.keys(steps).length - 1];
  }
  
  /**
   * Update a step's completion status
   * @param {Object} onboarding Onboarding state
   * @param {string} step Step to update
   * @param {boolean} isComplete Completion status
   * @returns {Object} Updated onboarding state
   */
  function updateStepCompletion(onboarding, step, isComplete) {
    if (!onboarding.steps[step]) {
      throw new Error(`Invalid onboarding step: ${step}`);
    }
    
    const updatedOnboarding = JSON.parse(JSON.stringify(onboarding));
    
    // Update step completion
    updatedOnboarding.steps[step].isComplete = isComplete;
    
    if (isComplete) {
      updatedOnboarding.steps[step].completedAt = new Date().toISOString();
    } else {
      updatedOnboarding.steps[step].completedAt = null;
    }
    
    // Calculate new progress
    updatedOnboarding.progress = calculateProgress(updatedOnboarding);
    
    // Check if all required steps are complete
    const allRequiredComplete = isOnboardingComplete(updatedOnboarding);
    
    if (allRequiredComplete && !updatedOnboarding.isComplete) {
      updatedOnboarding.isComplete = true;
      updatedOnboarding.completedAt = new Date().toISOString();
    } else if (!allRequiredComplete && updatedOnboarding.isComplete) {
      updatedOnboarding.isComplete = false;
      updatedOnboarding.completedAt = null;
    }
    
    return updatedOnboarding;
  }
  
  /**
   * Update a feature's interaction status
   * @param {Object} onboarding Onboarding state
   * @param {string} feature Feature to update
   * @param {boolean} introduced Whether the feature has been introduced
   * @param {boolean} interacted Whether the user has interacted with the feature
   * @returns {Object} Updated onboarding state
   */
  function updateFeatureStatus(onboarding, feature, introduced, interacted) {
    if (!onboarding.features[feature]) {
      throw new Error(`Invalid feature: ${feature}`);
    }
    
    const updatedOnboarding = JSON.parse(JSON.stringify(onboarding));
    
    // Update feature status
    if (introduced !== undefined) {
      updatedOnboarding.features[feature].introduced = introduced;
    }
    
    if (interacted !== undefined) {
      updatedOnboarding.features[feature].interacted = interacted;
    }
    
    return updatedOnboarding;
  }
  
  /**
   * Validate onboarding profile data
   * @param {Object} profile Profile data to validate
   * @returns {Object} Validation result with isValid flag and errors array
   */
  function validateProfile(profile) {
    const errors = [];
    
    // Required fields
    if (!profile.name.firstName.trim()) {
      errors.push('First name is required');
    }
    
    if (!profile.name.lastName.trim()) {
      errors.push('Last name is required');
    }
    
    // Validate experience level if provided
    if (profile.experience && 
        !['beginner', 'intermediate', 'advanced'].includes(profile.experience)) {
      errors.push('Experience must be one of: beginner, intermediate, advanced');
    }
    
    // Validate team size if provided
    if (profile.teamSize && typeof profile.teamSize === 'string') {
      const teamSize = profile.teamSize.trim();
      if (teamSize && isNaN(parseInt(teamSize))) {
        errors.push('Team size must be a number');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Validate onboarding preferences
   * @param {Object} preferences Preferences to validate
   * @returns {Object} Validation result with isValid flag and errors array
   */
  function validatePreferences(preferences) {
    const errors = [];
    
    // Check types
    if (preferences.showTutorials !== undefined && 
        typeof preferences.showTutorials !== 'boolean') {
      errors.push('showTutorials must be a boolean');
    }
    
    if (preferences.showTips !== undefined && 
        typeof preferences.showTips !== 'boolean') {
      errors.push('showTips must be a boolean');
    }
    
    if (preferences.enableEmailUpdates !== undefined && 
        typeof preferences.enableEmailUpdates !== 'boolean') {
      errors.push('enableEmailUpdates must be a boolean');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  module.exports = {
    DEFAULT_ONBOARDING_STATE,
    STEP_TRANSITIONS,
    initializeOnboarding,
    calculateProgress,
    isOnboardingComplete,
    isValidStepTransition,
    getNextRecommendedStep,
    updateStepCompletion,
    updateFeatureStatus,
    validateProfile,
    validatePreferences
  };RequiredStep;
    }
    
    // If all required steps are complete, find the first incomplete optional step
    const incompleteOptionalStep = Object.keys(steps)
      .find(key => !steps[key].required && !steps[key].isComplete);
    
    if (incompleteOptionalStep) {
      return incompleteOptionalStep;
    }
    
    // If everything is complete, return the last step
    return Object.keys(steps)[Object.keys(steps).length - 1];
  }
  
  /**
   * Update a step's completion status
   * @param {Object} onboarding Onboarding state
   * @param {string} step Step to update
   * @param {boolean} isComplete Completion status
   * @returns {Object} Updated onboarding state
   */
  function updateStepCompletion(onboarding, step, isComplete) {
    if (!onboarding.steps[step]) {
      throw new Error(`Invalid onboarding step: ${step}`);
    }
    
    const updatedOnboarding = JSON.parse(JSON.stringify(onboarding));
    
    // Update step completion
    updatedOnboarding.steps[step].isComplete = isComplete