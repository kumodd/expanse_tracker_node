const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    sparse: true // Allows multiple null values but enforces uniqueness for non-null
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    code: String,
    expiresAt: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Remove sensitive information when converting to JSON
UserSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.otp;
  return user;
};

module.exports = mongoose.model('User', UserSchema);