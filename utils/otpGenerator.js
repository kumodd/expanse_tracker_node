const crypto = require('crypto');

// Generate a random 6-digit OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Set OTP expiration time (10 minutes from now)
const generateOTPExpiry = () => {
  return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
};

// Verify if OTP is valid and not expired
const verifyOTP = (user, otpCode) => {
  if (!user.otp || !user.otp.code || !user.otp.expiresAt) {
    return false;
  }
  
  const isCodeValid = user.otp.code === otpCode;
  const isNotExpired = new Date() < user.otp.expiresAt;
  
  return isCodeValid && isNotExpired;
};

module.exports = {
  generateOTP,
  generateOTPExpiry,
  verifyOTP
};