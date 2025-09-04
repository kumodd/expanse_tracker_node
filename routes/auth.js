const express = require('express');
var request = require("request");
const User = require('../models/User');
const { generateOTP, generateOTPExpiry, verifyOTP } = require('../utils/otpGenerator');
const { generateToken } = require('../utils/jwt');
const { body, validationResult } = require('express-validator');


const router = express.Router();


// Request OTP
router.post('/request-otp', [
    body('phone').isMobilePhone().withMessage('Valid phone number is required'),
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
], async (req, res) => {
    
/* 
    #swagger.tags = ['Auth']
    #swagger.description = 'Request OTP for login/registration'
    #swagger.path = '/auth/request-otp'
  */
  
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { phone, name } = req.body;

        // Generate OTP
        const otpCode = generateOTP();
        const otpExpiry = generateOTPExpiry();

        // Find or create user
        let user = await User.findOne({ phone });

        if (!user) {
            user = await User.create({
                 name,
                phone,
                otp: {
                    code: otpCode,
                    expiresAt: otpExpiry
                },

            });
        } else {
            user.otp = {
                code: otpCode,
                expiresAt: otpExpiry
            };
            // Optionally update name if provided
            if (name) {
                user.name = name;
            }
            await user.save();
        }

        // In a real application, you would send the OTP via SMS or email
        // For demo purposes, we'll just log it to the console
        console.log(`OTP for ${phone}: ${otpCode}`);

        var options = {
            method: 'GET',
            url: 'https://console.authkey.io/request',
            qs:
            {
                authkey: process.env.AUTH_KEY,
                sms: 'Hello, This is test otp ${otpCode} message from Authkey.io',
                mobile: phone,
                country_code: '+91',
                sender: '13616'
            },
        };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);

            console.log(response);
        });

        res.status(200).json({
            success: true,
            message: 'OTP sent successfully',
            // In production, you wouldn't send the OTP in the response
            // This is just for testing
            // otp: process.env.NODE_ENV === 'development' ? otpCode : undefined
            otp: otpCode
        });
    } catch (error) {
        console.error('Error requesting OTP:', error);
        res.status(500).json({
            success: false,
            message: 'Error requesting OTP'
        });
    }
});

// Verify OTP and login
router.post('/verify-otp', [
    body('phone').isMobilePhone().withMessage('Valid phone number is required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], async (req, res) => {
     /* 
    #swagger.tags = ['Auth']
    #swagger.description = 'Verify otp for authentication'
    #swagger.path = '/auth/verify-otp'
  */
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { phone, otp } = req.body;

        // Find user
        const user = await User.findOne({ phone });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify OTP
        const isOTPValid = verifyOTP(user, otp);

        if (!isOTPValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }

        // Mark user as verified
        user.isVerified = true;
        user.otp = undefined; // Remove OTP after successful verification
        await user.save();

        // Generate JWT token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'OTP verified successfully',
            token,
            user: {
                id: user._id,
                phone: user.phone,
                isVerified: user.isVerified
            }
        });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying OTP'
        });
    }
});

// Get current user
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
        }

        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Error getting user:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting user'
        });
    }
});

module.exports = router;