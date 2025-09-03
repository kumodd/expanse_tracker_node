const requestLogger = (req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  console.log('Request Body:', req.body);
  console.log('Query Parameters:', req.query);
  console.log('---');
  next(); // Pass control to the next middleware
};

module.exports = requestLogger;