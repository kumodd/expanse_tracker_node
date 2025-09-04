const express = require('express');
const { body, validationResult } = require('express-validator');
const Expense = require('../models/Expense');
const { protect } = require('../utils/jwt');

const router = express.Router();

// Apply protect middleware to all expense routes
router.use(protect);

// GET /api/expenses - Get all expenses with optional filtering
router.get('/', async (req, res) => {
    /* 
   #swagger.tags = ['Expenses']
   #swagger.description = 'Get all expenses with optional filtering'
   #swagger.path = '/expenses'
 */
    try {
        const { category, minAmount, maxAmount, startDate, endDate, page = 1, limit = 10 } = req.query;

        // Build filter object
        let filter = { user: req.user._id };

        if (category) {
            filter.category = category;
        }

        if (minAmount || maxAmount) {
            filter.amount = {};
            if (minAmount) filter.amount.$gte = parseFloat(minAmount);
            if (maxAmount) filter.amount.$lte = parseFloat(maxAmount);
        }

        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate);
            if (endDate) filter.date.$lte = new Date(endDate);
        }

        // Execute query with pagination
        const expenses = await Expense.find(filter)
            .sort({ date: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        // Get total count for pagination
        const total = await Expense.countDocuments(filter);

        res.json({
            success: true,
            data: expenses,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error retrieving expenses",
            error: error.message
        });
    }
});

// GET /api/expenses/:id - Get a specific expense
router.get('/:id', async (req, res) => {
    /* 
#swagger.tags = ['Expenses']
#swagger.description = 'Get a specific expense'
#swagger.path = '/expenses'
*/
    try {
        const expense = await Expense.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: "Expense not found"
            });
        }

        res.json({
            success: true,
            data: expense
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error retrieving expense",
            error: error.message
        });
    }
});

// Validation rules for expense creation and update
const expenseValidationRules = [
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

// Middleware to check validation results
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

// POST /api/expenses - Create a new expense
router.post('/', expenseValidationRules, checkValidationResult, async (req, res) => {

    /* 
#swagger.tags = ['Expenses']
#swagger.description = 'Create a  expense'
#swagger.path = '/expenses'
*/
    try {
        const { title, amount, date, category, description } = req.body;

        const expense = await Expense.create({
            title,
            amount,
            date: date || Date.now(),
            category,
            description,
            user: req.user._id
        });

        res.status(201).json({
            success: true,
            data: expense
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        } else {
            res.status(500).json({
                success: false,
                message: "Error creating expense",
                error: error.message
            });
        }
    }
});

// PUT /api/expenses/:id - Update an existing expense
router.put('/:id', expenseValidationRules, checkValidationResult, async (req, res) => {
    /* 
#swagger.tags = ['Expenses']
#swagger.description = 'update exisiting expense'
#swagger.path = '/expenses'
*/
    try {
        const { title, amount, date, category, description } = req.body;

        const expense = await Expense.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: "Expense not found"
            });
        }

        // Update only the provided fields
        if (title) expense.title = title;
        if (amount) expense.amount = amount;
        if (date) expense.date = date;
        if (category) expense.category = category;
        if (description !== undefined) expense.description = description;

        await expense.save();

        res.json({
            success: true,
            data: expense
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        } else {
            res.status(500).json({
                success: false,
                message: "Error updating expense",
                error: error.message
            });
        }
    }
});

// DELETE /api/expenses/:id - Delete an expense
router.delete('/:id', async (req, res) => {
    /* 
#swagger.tags = ['Expenses']
#swagger.description = 'delete expense'
#swagger.path = '/expenses'
*/
    try {
        const expense = await Expense.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: "Expense not found"
            });
        }

        await Expense.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: "Expense deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting expense",
            error: error.message
        });
    }
});

// GET /api/expenses/summary/category - Get expenses by category
router.get('/summary/category', async (req, res) => {
    /* 
#swagger.tags = ['Expenses']
#swagger.description = 'Get expenses summary by category'
#swagger.path = '/expenses/summary/category'
*/
    try {
        const categorySummary = await Expense.aggregate([
            {
                $match: { user: req.user._id }
            },
            {
                $group: {
                    _id: '$category',
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { totalAmount: -1 }
            }
        ]);

        res.json({
            success: true,
            data: categorySummary
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error generating category summary",
            error: error.message
        });
    }
});

// GET /api/expenses/summary/monthly - Get monthly expenses
router.get('/summary/monthly', async (req, res) => {
    /* 
#swagger.tags = ['Expenses']
#swagger.description = 'Get monthly expenses summary '
#swagger.path = '/expenses/summary/monthly'
*/
    try {
        const monthlySummary = await Expense.aggregate([
            {
                $match: { user: req.user._id }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$date' },
                        month: { $month: '$date' }
                    },
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': -1, '_id.month': -1 }
            }
        ]);

        // Format the response to be more readable
        const formattedSummary = monthlySummary.map(item => ({
            year: item._id.year,
            month: item._id.month,
            totalAmount: item.totalAmount,
            count: item.count
        }));

        res.json({
            success: true,
            data: formattedSummary
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error generating monthly summary",
            error: error.message
        });
    }
});

// GET /api/expenses/summary/period - Get expenses for a specific period
router.get('/summary/period', async (req, res) => {
    /* 
#swagger.tags = ['Expenses']
#swagger.description = 'Get expenses for a specific period '
#swagger.path = '/expenses/summary/period'
*/
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: "startDate and endDate are required"
            });
        }

        const periodSummary = await Expense.aggregate([
            {
                $match: {
                    user: req.user._id,
                    date: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$amount' },
                    averageAmount: { $avg: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            success: true,
            data: periodSummary.length > 0 ? periodSummary[0] : { totalAmount: 0, averageAmount: 0, count: 0 }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error generating period summary",
            error: error.message
        });
    }
});

module.exports = router;