const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/database');
const Expense = require('./models/Expense');

// Import middleware
const requestLogger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const { validateExpense, checkValidationResult } = require('./middleware/validation');

const app = express();
const PORT = process.env.PORT || 5000;
const url=process.env.URI


// Connect to MongoDB
connectDB(url);


// Global Middleware (applied to all routes)
app.use(cors());
app.use(express.json());
app.use(requestLogger); // Log all requests


// GET /api/expenses - Get all expenses with optional filtering
app.get('/api/expenses', async (req, res) => {
  try {
    const { category, minAmount, maxAmount, startDate, endDate, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    let filter = {};
    
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
app.get('/api/expenses/:id', async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    
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

// POST /api/expenses - Create a new expense
app.post('/api/expenses', validateExpense, checkValidationResult, async (req, res) => {
  try {
    const { title, amount, date, category, description } = req.body;
    
    // Basic validation
    if (!title || !amount || !category) {
      return res.status(400).json({
        success: false,
        message: "Title, amount, and category are required"
      });
    }
    
    const expense = await Expense.create({
      title,
      amount,
      date: date || Date.now(),
      category,
      description
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
app.put('/api/expenses/:id', async (req, res) => {
  try {
    const { title, amount, date, category, description } = req.body;
    
    const expense = await Expense.findById(req.params.id);
    
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
app.delete('/api/expenses/:id', async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    
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
app.get('/api/expenses/summary/category', async (req, res) => {
  try {
    const categorySummary = await Expense.aggregate([
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
app.get('/api/expenses/summary/monthly', async (req, res) => {
  try {
    const monthlySummary = await Expense.aggregate([
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
app.get('/api/expenses/summary/period', async (req, res) => {
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

// // Handle 404 errors
// app.use('/*', (req, res) => {
//   res.status(404).json({
//     success: false,
//     message: "API endpoint not found"
//   });
// });
// Error handling middleware - Must be the last middleware
app.use(errorHandler);
// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});