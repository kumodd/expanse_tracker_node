const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB(process.env.URI);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);

// Handle 404 errors
// app.use('*', (req, res) => {
//   res.status(404).json({
//     success: false,
//     message: "API endpoint not found"
//   });
// });

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});