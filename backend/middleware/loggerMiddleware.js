const logger = require('../utils/logger');

/**
 * Middleware for logging API requests to MongoDB Atlas
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const loggerMiddleware = async (req, res, next) => {
  // Skip logging for some routes like health checks or static files
  if (req.path.includes('/health') || req.path.includes('.')) {
    return next();
  }

  // Extract IP address, either from proxy headers or direct
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  // Get initial log details
  const logDetails = {
    method: req.method,
    path: req.path,
    query: req.query,
    body: sanitizeRequestBody(req.body), // Prevent sensitive data logging
    headers: sanitizeHeaders(req.headers)
  };

  // Get user ID from auth if available
  const userId = req.user?.userId || null;

  try {
    // Log the API request
    await logger.logActivity({
      action: 'view_page', 
      user: userId,
      details: {
        ...logDetails,
        type: 'api_request'
      },
      ip,
      userAgent: req.headers['user-agent']
    });
  } catch (error) {
    // Just log to console, don't interrupt the request
    console.error('Error logging request:', error);
  }

  // Continue with the request
  next();
};

/**
 * Sanitize request body to remove sensitive information
 * 
 * @param {Object} body - Request body
 * @returns {Object} Sanitized body
 */
function sanitizeRequestBody(body) {
  if (!body) return {};
  
  // Create a shallow copy
  const sanitized = { ...body };
  
  // Remove sensitive fields
  const sensitiveFields = ['password', 'token', 'credit_card', 'cardNumber', 'cvv', 'secret'];
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
}

/**
 * Sanitize headers to remove sensitive information
 * 
 * @param {Object} headers - Request headers
 * @returns {Object} Sanitized headers
 */
function sanitizeHeaders(headers) {
  if (!headers) return {};
  
  // Create a shallow copy
  const sanitized = { ...headers };
  
  // Remove sensitive headers
  const sensitiveHeaders = ['authorization', 'cookie', 'x-auth-token'];
  
  sensitiveHeaders.forEach(header => {
    if (sanitized[header]) {
      sanitized[header] = '[REDACTED]';
    }
  });
  
  return sanitized;
}

module.exports = loggerMiddleware; 