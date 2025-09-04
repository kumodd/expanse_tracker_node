const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');

// ✅ Swagger imports
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger-output.json');

const app = express();
const PORT = process.env.PORT || 5500;

// Connect to MongoDB
connectDB(process.env.URI);

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Swagger Docs (MUST be before other routes sometimes)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📑 API Docs available at http://localhost:${PORT}/api-docs`);
});