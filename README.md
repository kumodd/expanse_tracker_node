# Expense Manager API

A robust and secure backend API for managing personal expenses with OTP-based authentication, built with Node.js, Express, and MongoDB.

## 🚀 Features

- **OTP-Based Authentication**: Secure login using one-time passwords via SMS/email
- **JWT Token Authorization**: Stateless authentication with JSON Web Tokens
- **Expense Management**: Full CRUD operations for expense tracking
- **Advanced Filtering**: Filter expenses by category, date range, amount, etc.
- **Analytical Summaries**: Category-wise and monthly expense summaries
- **RESTful API Design**: Clean and consistent API endpoints
- **Comprehensive Documentation**: Interactive API documentation with Swagger
- **Input Validation**: Robust validation using express-validator
- **Error Handling**: Consistent error responses and logging
- **Pagination Support**: Efficient data retrieval for large datasets

## 🛠️ Technology Stack

- **Backend Framework**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with OTP verification
- **API Documentation**: Swagger/OpenAPI
- **Deployment**: Render (or your chosen platform)
- **Environment Management**: dotenv

## 📦 Installation

1. Clone the repository:
```bash
git clone https://https://github.com/kumodd/expanse_tracker_node.git
cd expanse_tracker_node
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Edit the `.env` file with your configuration.

4. Start the development server:
```bash
npm run dev
```

## ⚙️ Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=5000
URI=mongodb://localhost:27017/expense-manager
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
NODE_ENV=development
AUTH_KEY=otp_service_api_key_from_authKey.io
```

## 📚 API Documentation

Interactive API documentation is available at `/api-docs` when the server is running.

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/request-otp` | Request an OTP for authentication |
| POST | `/api/auth/verify-otp` | Verify OTP and receive JWT token |
| GET | `/api/auth/me` | Get current user information |

### Expense Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses` | Get all expenses (with filtering) |
| POST | `/api/expenses` | Create a new expense |
| GET | `/api/expenses/:id` | Get a specific expense |
| PUT | `/api/expenses/:id` | Update an expense |
| DELETE | `/api/expenses/:id` | Delete an expense |
| GET | `/api/expenses/summary/category` | Get category-wise summary |
| GET | `/api/expenses/summary/monthly` | Get monthly summary |
| GET | `/api/expenses/summary/period` | Get summary for a specific period |

## 🗂️ Project Structure

```
expense-manager-api/
├── config/
│   └── database.js          # Database connection configuration
├── controllers/
│   ├── authController.js    # Authentication logic
│   └── expenseController.js # Expense management logic
├── middleware/
│   ├── logger.js              # logging middleware
│   ├── errorHandler.js      # Global error handling
│   └── validation.js        # Input validation for auth
├── models/
│   ├── User.js              # User model
│   └── Expense.js           # Expense model
├── routes/
│   ├── auth.js              # Authentication routes
│   └── expenses.js          # Expense routes
├── utils/
│   ├── otpGenerator.js      # OTP generation and verification
│   ├── jwt.js               # JWT token management
│   
├── swagger.js               # Swagger documentation setup
├── server.js                # Application entry point
└── .env                     # Environment variables
```

## 🚦 Usage Examples

### Requesting an OTP

```bash
curl -X POST http://localhost:5000/api/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "9135086955","name":"Kumod"}'
```

### Verifying OTP and Getting Token

```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "9135086955", "otp": "123456"}'
```

### Creating an Expense (Authenticated)

```bash
curl -X POST http://localhost:5000/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -d '{
    "title": "Groceries",
    "amount": 75.50,
    "date": "2023-05-15",
    "category": "Food",
    "description": "Weekly grocery shopping"
  }'
```

### Getting Expenses with Filtering

```bash
curl -X GET "http://localhost:5000/api/expenses?category=Food&minAmount=50&page=1&limit=10" \
  -H "Authorization: Bearer <your_jwt_token>"
```

## 🚢 Deployment

### Deploying to Render

1. Push your code to a GitHub repository
2. Connect your repository to Render
3. Set up environment variables in the Render dashboard
4. Deploy your application

The API will be available at your Render URL (e.g., `https://expense-tracker-mf0f.onrender.com/api-docs`).

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

If you have any questions or issues, please open an issue on GitHub or contact me at kumod353@gmail.com.

## 🙏 Acknowledgments

- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [JWT](https://jwt.io/)
- [Swagger](https://swagger.io/)
- [Render](https://render.com/)

---

**Note**: This is a backend API. You'll need a frontend client (web or mobile) to fully utilize the expense management functionality.
