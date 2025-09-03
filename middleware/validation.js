const { body, validationResult } = require('express-validator'); // Install: npm install express-validator

// Validation rules for expense creation
const validateExpense = [
  body('title')
    .isLength({ min: 1, max: 50 })
    .withMessage('Title must be between 1 and 50 characters')
    .trim(),
  
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  
  body('date')
    .isISO8601()
    .withMessage('Date must be in ISO 8601 format (YYYY-MM-DD)'),
  
  body('category')
    .isIn(['Food', 'Transportation', 'Entertainment', 'Utilities', 'Healthcare', 'Shopping', 'Education', 'Other'])
    .withMessage('Invalid category'),
  
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Description cannot exceed 200 characters')
];

// Middleware to check for validation errors
const checkValidationResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

module.exports = {
  validateExpense,
  checkValidationResult
};