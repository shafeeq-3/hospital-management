import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Staff from '../models/Staff.js';
import { catchAsync, AppError } from '../utils/errorHandler.js';
import { sendTokenResponse, generateAccessToken } from '../utils/jwt.js';
import { successResponse } from '../utils/response.js';

// Register new user
export const register = catchAsync(async (req, res, next) => {
  const { email, password, role, firstName, lastName, phone } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('Email already registered', 400));
  }

  // Create user
  const user = await User.create({
    email,
    password,
    role,
    firstName,
    lastName,
    phone,
  });

  // Create role-specific profile
  let profile = null;
  if (role === 'patient') {
    profile = await Patient.create({
      user: user._id,
      dateOfBirth: req.body.dateOfBirth || new Date('2000-01-01'),
      gender: req.body.gender || 'other',
      address: req.body.address || {},
    });
  } else if (role === 'doctor') {
    profile = await Doctor.create({
      user: user._id,
      specialization: req.body.specialization || 'General Medicine',
      qualification: req.body.qualification || 'MBBS',
      experience: req.body.experience || 0,
      licenseNumber: req.body.licenseNumber || `LIC${Date.now()}`,
      department: req.body.department || 'General',
      salary: req.body.salary || 0,
    });
  } else if (role === 'staff') {
    profile = await Staff.create({
      user: user._id,
      position: req.body.position || 'General Staff',
      department: req.body.department || 'Administration',
      salary: req.body.salary || 0,
    });
  }

  // Send token response with profile
  const accessToken = generateAccessToken(user._id);

  // Cookie options
  const cookieOptions = {
    expires: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  // Remove sensitive data
  user.password = undefined;

  res
    .status(201)
    .cookie('token', accessToken, cookieOptions)
    .json({
      success: true,
      message: 'Registration successful',
      data: {
        user,
        profile,
        accessToken,
      },
    });
});

// Login user
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Find user and include password
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Invalid email or password', 401));
  }

  if (!user.isActive) {
    return next(new AppError('Your account has been deactivated', 403));
  }

  // Update last login
  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  // Get user profile based on role
  let profile = null;
  if (user.role === 'patient') {
    profile = await Patient.findOne({ user: user._id }).populate('assignedDoctor');
  } else if (user.role === 'doctor') {
    profile = await Doctor.findOne({ user: user._id });
  } else if (user.role === 'staff') {
    profile = await Staff.findOne({ user: user._id });
  }

  // Send token response with profile
  const accessToken = generateAccessToken(user._id);

  // Cookie options
  const cookieOptions = {
    expires: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  // Remove sensitive data
  user.password = undefined;

  res
    .status(200)
    .cookie('token', accessToken, cookieOptions)
    .json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        profile,
        accessToken,
      },
    });
});

// Get current user
export const getCurrentUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  let profile = null;
  if (user.role === 'patient') {
    profile = await Patient.findOne({ user: user._id }).populate('assignedDoctor');
  } else if (user.role === 'doctor') {
    profile = await Doctor.findOne({ user: user._id });
  } else if (user.role === 'staff') {
    profile = await Staff.findOne({ user: user._id });
  }

  successResponse(res, 200, 'User retrieved successfully', {
    user,
    profile,
  });
});

// Logout user
export const logout = catchAsync(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  successResponse(res, 200, 'Logout successful');
});

// Change password
export const changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');

  // Check current password
  if (!(await user.comparePassword(currentPassword))) {
    return next(new AppError('Current password is incorrect', 401));
  }

  // Update password
  user.password = newPassword;
  await user.save();

  successResponse(res, 200, 'Password changed successfully');
});
