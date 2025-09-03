const express=require('express');
const cors=require('cors');
require('dotenv').config();
const app=express();
const PORT=process.env.PORT || 5000;


//middleware
app.use(cors());
app.use(express.json());

//in memory db
let expenses=[];
let currentId=1;
app.listen(PORT,()=>{
    console.log(`server is running on port: ${PORT}`)

});


// GET /api/expenses - Get all expenses
app.get('/api/expenses', (req, res) => {
  try {
    // Optional query parameters for filtering
    const { category, minAmount, maxAmount, startDate, endDate } = req.query;
    
    let filteredExpenses = [...expenses];
    
    // Filter by category
    if (category) {
      filteredExpenses = filteredExpenses.filter(expense => 
        expense.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    // Filter by amount range
    if (minAmount) {
      filteredExpenses = filteredExpenses.filter(expense => 
        expense.amount >= parseFloat(minAmount)
      );
    }
    
    if (maxAmount) {
      filteredExpenses = filteredExpenses.filter(expense => 
        expense.amount <= parseFloat(maxAmount)
      );
    }
    
    // Filter by date range
    if (startDate) {
      filteredExpenses = filteredExpenses.filter(expense => 
        expense.date >= startDate
      );
    }
    
    if (endDate) {
      filteredExpenses = filteredExpenses.filter(expense => 
        expense.date <= endDate
      );
    }
    
    res.json({
      success: true,
      data: filteredExpenses,
      total: filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving expenses"
    });
  }
});

// GET /api/expenses/:id - Get a specific expense
app.get('/api/expenses/:id', (req, res) => {
  try {
    const expense = expenses.find(e => e.id === parseInt(req.params.id));
    
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
      message: "Error retrieving expense"
    });
  }
});

// POST /api/expenses - Create a new expense
app.post('/api/expenses', (req, res) => {
  try {
    const { title, amount, date, category, description } = req.body;
    
    // Basic validation
    if (!title || !amount || !date || !category) {
      return res.status(400).json({
        success: false,
        message: "Title, amount, date, and category are required"
      });
    }
    
    const newExpense = {
      id: currentId++,
      title,
      amount: parseFloat(amount),
      date,
      category,
      description: description || ""
    };
    
    expenses.push(newExpense);
    
    res.status(201).json({
      success: true,
      data: newExpense
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating expense"
    });
  }
});

// PUT /api/expenses/:id - Update an existing expense
app.put('/api/expenses/:id', (req, res) => {
  try {
    const expenseIndex = expenses.findIndex(e => e.id === parseInt(req.params.id));
    
    if (expenseIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Expense not found"
      });
    }
    
    const { title, amount, date, category, description } = req.body;
    
    // Update only the provided fields
    expenses[expenseIndex] = {
      ...expenses[expenseIndex],
      ...(title && { title }),
      ...(amount && { amount: parseFloat(amount) }),
      ...(date && { date }),
      ...(category && { category }),
      ...(description !== undefined && { description })
    };
    
    res.json({
      success: true,
      data: expenses[expenseIndex]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating expense"
    });
  }
});

// DELETE /api/expenses/:id - Delete an expense
app.delete('/api/expenses/:id', (req, res) => {
  try {
    const expenseIndex = expenses.findIndex(e => e.id === parseInt(req.params.id));
    
    if (expenseIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Expense not found"
      });
    }
    
    expenses.splice(expenseIndex, 1);  //start removing from given index and how many to delete(1)
    
    res.json({
      success: true,
      message: "Expense deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting expense"
    });
  }
});

// GET /api/expenses/summary/category - Get expenses by category
app.get('/api/expenses/summary/category', (req, res) => {
  try {
    const categorySummary = {};
    
    expenses.forEach(expense => {
      if (categorySummary[expense.category]) {
        categorySummary[expense.category] += expense.amount;
      } else {
        categorySummary[expense.category] = expense.amount;
      }
    });
    
    res.json({
      success: true,
      data: categorySummary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error generating category summary"
    });
  }
});

// GET /api/expenses/summary/monthly - Get monthly expenses
app.get('/api/expenses/summary/monthly', (req, res) => {
  try {
    const monthlySummary = {};
    
    expenses.forEach(expense => {
      // Extract year and month from date (format: YYYY-MM)
      const yearMonth = expense.date.substring(0, 7);
      
      if (monthlySummary[yearMonth]) {
        monthlySummary[yearMonth] += expense.amount;
      } else {
        monthlySummary[yearMonth] = expense.amount;
      }
    });
    
    res.json({
      success: true,
      data: monthlySummary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error generating monthly summary"
    });
  }
});