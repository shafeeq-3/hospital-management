import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Staff from '../models/Staff.js';
import Test from '../models/Test.js';
import Report from '../models/Report.js';
import Payment from '../models/Payment.js';
import Salary from '../models/Salary.js';
import Announcement from '../models/Announcement.js';
import Settings from '../models/Settings.js';
import { catchAsync, AppError } from '../utils/errorHandler.js';
import { successResponse, paginatedResponse } from '../utils/response.js';

// Dashboard analytics - Simplified
export const getDashboardStats = catchAsync(async (req, res, next) => {
  const [
    totalPatients,
    totalDoctors,
    totalStaff,
    totalReports,
    totalPayments,
  ] = await Promise.all([
    Patient.countDocuments(),
    Doctor.countDocuments(),
    Staff.countDocuments(),
    Report.countDocuments(),
    Payment.countDocuments({ paymentStatus: 'completed' }),
  ]);

  const totalUsers = totalPatients + totalDoctors + totalStaff;

  successResponse(res, 200, 'Dashboard stats retrieved successfully', {
    totalUsers,
    totalPatients,
    totalDoctors,
    totalStaff,
    totalReports,
    totalPayments,
  });
});

// User Management
export const getAllUsers = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const query = {};
  
  // Role filter
  if (req.query.role) {
    query.role = req.query.role;
  }
  
  // Active status filter
  if (req.query.isActive !== undefined) {
    query.isActive = req.query.isActive === 'true';
  }
  
  // Search filter
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    query.$or = [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { email: searchRegex },
    ];
  }

  const totalItems = await User.countDocuments(query);
  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const pagination = {
    page,
    limit,
    totalPages: Math.ceil(totalItems / limit),
    totalItems,
    hasNextPage: page < Math.ceil(totalItems / limit),
    hasPrevPage: page > 1,
  };

  paginatedResponse(res, 200, 'Users retrieved successfully', users, pagination);
});

export const getUserById = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password');
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  let profile = null;
  if (user.role === 'patient') {
    profile = await Patient.findOne({ user: user._id });
  } else if (user.role === 'doctor') {
    profile = await Doctor.findOne({ user: user._id });
  } else if (user.role === 'staff') {
    profile = await Staff.findOne({ user: user._id });
  }

  successResponse(res, 200, 'User retrieved successfully', { user, profile });
});

export const updateUser = catchAsync(async (req, res, next) => {
  const allowedFields = ['firstName', 'lastName', 'phone', 'isActive'];
  
  const updates = {};
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  const user = await User.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  successResponse(res, 200, 'User updated successfully', user);
});

export const deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  user.isActive = false;
  await user.save();

  successResponse(res, 200, 'User deactivated successfully');
});

// Test Management
export const createTest = catchAsync(async (req, res, next) => {
  const test = await Test.create({
    ...req.body,
    createdBy: req.user._id,
  });

  successResponse(res, 201, 'Test created successfully', test);
});

export const getAllTests = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const query = {};
  if (req.query.category) {
    query.category = req.query.category;
  }
  if (req.query.isActive !== undefined) {
    query.isActive = req.query.isActive === 'true';
  }

  const totalItems = await Test.countDocuments(query);
  const tests = await Test.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const pagination = {
    page,
    limit,
    totalPages: Math.ceil(totalItems / limit),
    totalItems,
    hasNextPage: page < Math.ceil(totalItems / limit),
    hasPrevPage: page > 1,
  };

  paginatedResponse(res, 200, 'Tests retrieved successfully', tests, pagination);
});

export const updateTest = catchAsync(async (req, res, next) => {
  const test = await Test.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!test) {
    return next(new AppError('Test not found', 404));
  }

  successResponse(res, 200, 'Test updated successfully', test);
});

export const deleteTest = catchAsync(async (req, res, next) => {
  const test = await Test.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!test) {
    return next(new AppError('Test not found', 404));
  }

  successResponse(res, 200, 'Test deactivated successfully');
});

// Salary Management
export const assignSalary = catchAsync(async (req, res, next) => {
  const { employeeId, employeeType, month, year, baseSalary, allowances, bonuses, deductions } = req.body;

  const existingSalary = await Salary.findOne({
    employee: employeeId,
    month,
    year,
  });

  if (existingSalary) {
    return next(new AppError('Salary already assigned for this month', 400));
  }

  const salary = await Salary.create({
    employee: employeeId,
    employeeType,
    month,
    year,
    baseSalary,
    allowances: allowances || 0,
    bonuses: bonuses || 0,
    deductions: deductions || 0,
    createdBy: req.user._id,
  });

  successResponse(res, 201, 'Salary assigned successfully', salary);
});

export const updateSalaryStatus = catchAsync(async (req, res, next) => {
  const { paymentStatus, paymentDate, paymentMethod } = req.body;

  const salary = await Salary.findByIdAndUpdate(
    req.params.id,
    { paymentStatus, paymentDate, paymentMethod },
    { new: true, runValidators: true }
  );

  if (!salary) {
    return next(new AppError('Salary record not found', 404));
  }

  successResponse(res, 200, 'Salary status updated successfully', salary);
});

export const getAllSalaries = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const query = {};
  if (req.query.employeeType) {
    query.employeeType = req.query.employeeType;
  }
  if (req.query.paymentStatus) {
    query.paymentStatus = req.query.paymentStatus;
  }

  const totalItems = await Salary.countDocuments(query);
  const salaries = await Salary.find(query)
    .populate('employee', 'firstName lastName email')
    .sort({ year: -1, month: -1 })
    .skip(skip)
    .limit(limit);

  const pagination = {
    page,
    limit,
    totalPages: Math.ceil(totalItems / limit),
    totalItems,
    hasNextPage: page < Math.ceil(totalItems / limit),
    hasPrevPage: page > 1,
  };

  paginatedResponse(res, 200, 'Salaries retrieved successfully', salaries, pagination);
});

// Announcement Management
export const createAnnouncement = catchAsync(async (req, res, next) => {
  const announcement = await Announcement.create({
    ...req.body,
    createdBy: req.user._id,
  });

  successResponse(res, 201, 'Announcement created successfully', announcement);
});

export const updateAnnouncement = catchAsync(async (req, res, next) => {
  const announcement = await Announcement.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!announcement) {
    return next(new AppError('Announcement not found', 404));
  }

  successResponse(res, 200, 'Announcement updated successfully', announcement);
});

export const deleteAnnouncement = catchAsync(async (req, res, next) => {
  const announcement = await Announcement.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!announcement) {
    return next(new AppError('Announcement not found', 404));
  }

  successResponse(res, 200, 'Announcement deactivated successfully');
});

export const getAllAnnouncements = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const query = {};
  if (req.query.isActive !== undefined) {
    query.isActive = req.query.isActive === 'true';
  }

  const totalItems = await Announcement.countDocuments(query);
  const announcements = await Announcement.find(query)
    .populate('createdBy', 'firstName lastName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const pagination = {
    page,
    limit,
    totalPages: Math.ceil(totalItems / limit),
    totalItems,
    hasNextPage: page < Math.ceil(totalItems / limit),
    hasPrevPage: page > 1,
  };

  paginatedResponse(res, 200, 'Announcements retrieved successfully', announcements, pagination);
});

// Payment Management
export const getAllPayments = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const query = {};
  if (req.query.paymentStatus) {
    query.paymentStatus = req.query.paymentStatus;
  }

  const totalItems = await Payment.countDocuments(query);
  const payments = await Payment.find(query)
    .populate('patient')
    .populate('billing')
    .sort({ paymentDate: -1 })
    .skip(skip)
    .limit(limit);

  const pagination = {
    page,
    limit,
    totalPages: Math.ceil(totalItems / limit),
    totalItems,
    hasNextPage: page < Math.ceil(totalItems / limit),
    hasPrevPage: page > 1,
  };

  paginatedResponse(res, 200, 'Payments retrieved successfully', payments, pagination);
});

// Settings Management
export const getSettings = catchAsync(async (req, res, next) => {
  let settings = await Settings.findOne();
  
  if (!settings) {
    settings = await Settings.create({});
  }

  successResponse(res, 200, 'Settings retrieved successfully', settings);
});

export const updateSettings = catchAsync(async (req, res, next) => {
  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create({
      ...req.body,
      updatedBy: req.user._id,
    });
  } else {
    Object.keys(req.body).forEach(key => {
      settings[key] = req.body[key];
    });
    settings.updatedBy = req.user._id;
    await settings.save();
  }

  successResponse(res, 200, 'Settings updated successfully', settings);
});

// Search
export const searchAdmin = catchAsync(async (req, res, next) => {
  const { q } = req.query;
  
  if (!q || q.length < 2) {
    return successResponse(res, 200, 'Search results', []);
  }

  const searchRegex = new RegExp(q, 'i');
  const results = [];

  // Search in users
  const users = await User.find({
    $or: [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { email: searchRegex }
    ]
  }).select('firstName lastName email role').limit(5);

  users.forEach(user => {
    results.push({
      type: 'user',
      title: `${user.firstName} ${user.lastName}`,
      description: `${user.email} - ${user.role}`,
      id: user._id
    });
  });

  // Search in tests
  const tests = await Test.find({
    $or: [
      { testCode: searchRegex },
      { testName: searchRegex }
    ]
  }).limit(5);

  tests.forEach(test => {
    results.push({
      type: 'test',
      title: test.testName,
      description: `${test.testCode} - $${test.price}`,
      id: test._id
    });
  });

  // Search in announcements
  const announcements = await Announcement.find({
    $or: [
      { title: searchRegex },
      { message: searchRegex }
    ]
  }).limit(5);

  announcements.forEach(announcement => {
    results.push({
      type: 'announcement',
      title: announcement.title,
      description: announcement.message.substring(0, 100),
      id: announcement._id
    });
  });

  successResponse(res, 200, 'Search results', results);
});
