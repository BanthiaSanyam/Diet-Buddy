const UserLog = require('../models/UserLog');

/**
 * Logger utility for tracking user activities and system events
 */
const logger = {
  /**
   * Log a user activity
   * 
   * @param {Object} options - Log options
   * @param {string} options.action - The action performed (must match UserLog schema enum)
   * @param {Object} options.user - User object or user ID (optional for anonymous logs)
   * @param {Object} options.details - Additional details about the action
   * @param {string} options.ip - IP address of the user (optional)
   * @param {string} options.userAgent - User agent string (optional)
   * @returns {Promise<Object>} The created log entry
   */
  async logActivity({ action, user, details = {}, ip, userAgent }) {
    try {
      const logEntry = {
        action,
        details,
        ip,
        userAgent
      };

      // Add user reference if available
      if (user) {
        logEntry.user = typeof user === 'object' ? user._id || user.id : user;
      }

      const log = new UserLog(logEntry);
      await log.save();
      
      // Don't wait for the log to be saved
      console.log(`[LOG] ${action}${user ? ` by user ${logEntry.user}` : ' (anonymous)'}`);
      
      return log;
    } catch (error) {
      console.error('Error logging activity:', error);
      // Don't throw, logging should never break the application
      return null;
    }
  },

  /**
   * Log a page view
   * 
   * @param {Object} options - Log options
   * @param {Object} options.user - User object or user ID (optional)
   * @param {string} options.page - The page that was viewed
   * @param {string} options.ip - IP address of the user (optional)
   * @param {string} options.userAgent - User agent string (optional)
   * @returns {Promise<Object>} The created log entry
   */
  async logPageView({ user, page, ip, userAgent }) {
    return this.logActivity({
      action: 'view_page',
      user,
      details: { page },
      ip,
      userAgent
    });
  },

  /**
   * Log a workout completion
   * 
   * @param {Object} options - Log options
   * @param {Object} options.user - User object or user ID
   * @param {Object} options.workout - Workout details
   * @returns {Promise<Object>} The created log entry
   */
  async logWorkoutComplete({ user, workout }) {
    return this.logActivity({
      action: 'complete_workout',
      user,
      details: { workout }
    });
  },

  /**
   * Log meal tracking
   * 
   * @param {Object} options - Log options
   * @param {Object} options.user - User object or user ID
   * @param {Object} options.meal - Meal details
   * @returns {Promise<Object>} The created log entry
   */
  async logMealTracking({ user, meal }) {
    return this.logActivity({
      action: 'meal_tracking',
      user,
      details: { meal }
    });
  },

  /**
   * Log steps tracking
   * 
   * @param {Object} options - Log options
   * @param {Object} options.user - User object or user ID
   * @param {number} options.steps - Number of steps
   * @returns {Promise<Object>} The created log entry
   */
  async logStepsTracking({ user, steps }) {
    return this.logActivity({
      action: 'steps_tracking',
      user,
      details: { steps }
    });
  },

  /**
   * Log badge earned
   * 
   * @param {Object} options - Log options
   * @param {Object} options.user - User object or user ID
   * @param {Object} options.badge - Badge details
   * @returns {Promise<Object>} The created log entry
   */
  async logBadgeEarned({ user, badge }) {
    return this.logActivity({
      action: 'badge_earned',
      user,
      details: { badge }
    });
  },

  /**
   * Log error
   * 
   * @param {Object} options - Log options
   * @param {Error} options.error - Error object
   * @param {Object} options.user - User object or user ID (optional)
   * @param {Object} options.context - Error context
   * @returns {Promise<Object>} The created log entry
   */
  async logError({ error, user, context = {} }) {
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      ...context
    };

    return this.logActivity({
      action: 'error',
      user,
      details: errorDetails
    });
  }
};

module.exports = logger; 