// swagger.js
const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "Expense Tracker API",
    description: "API documentation for Auth & Expense management",
  },
  host: "localhost:5500", // change for production
  schemes: ["http"],
  basePath: "/api",
  securityDefinitions: {
    bearerAuth: {
      type: "apiKey",
      name: "Authorization",
      in: "header",
      description: "Enter JWT token in format: Bearer <token>",
    },
  },
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./routes/auth.js", "./routes/expenses.js"]; // add more routes if needed

swaggerAutogen(outputFile, endpointsFiles, doc);