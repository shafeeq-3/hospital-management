import Patient from '../models/Patient.js';
import Report from '../models/Report.js';
import Billing from '../models/Billing.js';
import Payment from '../models/Payment.js';
import { catchAsync, AppError } from '../utils/errorHandler.js';
import { successResponse, paginatedResponse } from '../utils/response.js';

// Get patient profile
export const getProfile = catchAsync(async (req, res, next) => {
  const patient = await Patient.findOne({ user: req.user._id })
    .populate('user', '-password -refreshToken')
    .populate('assignedDoctor');

  if (!patient) {
    return next(new AppError('Patient profile not found', 404));
  }

  successResponse(res, 200, 'Profile retrieved successfully', patient);
});

// Update patient profile
export const updateProfile = catchAsync(async (req, res, next) => {
  const allowedFields = [
    'dateOfBirth',
    'gender',
    'bloodGroup',
    'address',
    'emergencyContact',
    'allergies',
    'currentMedications',
  ];

  const updates = {};
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  const patient = await Patient.findOneAndUpdate(
    { user: req.user._id },
    updates,
    { new: true, runValidators: true }
  ).populate('user', '-password -refreshToken');

  if (!patient) {
    return next(new AppError('Patient profile not found', 404));
  }

  successResponse(res, 200, 'Profile updated successfully', patient);
});

// Get all reports for patient
export const getMyReports = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const patient = await Patient.findOne({ user: req.user._id });
  if (!patient) {
    return next(new AppError('Patient profile not found', 404));
  }

  const query = { patient: patient._id };
  
  // Filter by status if provided
  if (req.query.status) {
    query.status = req.query.status;
  }

  const totalItems = await Report.countDocuments(query);
  const reports = await Report.find(query)
    .populate('test', 'testName category price')
    .populate({
      path: 'doctor',
      populate: { path: 'user', select: 'firstName lastName' }
    })
    .sort({ reportDate: -1 })
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

  paginatedResponse(res, 200, 'Reports retrieved successfully', reports, pagination);
});

// Get single report
export const getReportById = catchAsync(async (req, res, next) => {
  const patient = await Patient.findOne({ user: req.user._id });
  if (!patient) {
    return next(new AppError('Patient profile not found', 404));
  }

  const report = await Report.findOne({
    _id: req.params.id,
    patient: patient._id,
  })
    .populate('test')
    .populate({
      path: 'doctor',
      populate: { path: 'user', select: 'firstName lastName' }
    })
    .populate('patient');

  if (!report) {
    return next(new AppError('Report not found', 404));
  }

  successResponse(res, 200, 'Report retrieved successfully', report);
});

// Get billing history
export const getMyBillings = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const patient = await Patient.findOne({ user: req.user._id });
  if (!patient) {
    return next(new AppError('Patient profile not found', 404));
  }

  const query = { patient: patient._id };
  
  if (req.query.status) {
    query.status = req.query.status;
  }

  const totalItems = await Billing.countDocuments(query);
  const billings = await Billing.find(query)
    .sort({ billDate: -1 })
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

  paginatedResponse(res, 200, 'Billing history retrieved successfully', billings, pagination);
});

// Get payment history
export const getMyPayments = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const patient = await Patient.findOne({ user: req.user._id });
  if (!patient) {
    return next(new AppError('Patient profile not found', 404));
  }

  const query = { patient: patient._id };

  const totalItems = await Payment.countDocuments(query);
  const payments = await Payment.find(query)
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

  paginatedResponse(res, 200, 'Payment history retrieved successfully', payments, pagination);
});

// Get total amount due
export const getTotalDue = catchAsync(async (req, res, next) => {
  const patient = await Patient.findOne({ user: req.user._id });
  if (!patient) {
    return next(new AppError('Patient profile not found', 404));
  }

  const pendingBills = await Billing.find({
    patient: patient._id,
    paymentStatus: { $in: ['unpaid', 'partially-paid'] },
  });

  const totalDue = pendingBills.reduce((sum, bill) => sum + bill.dueAmount, 0);

  successResponse(res, 200, 'Total due amount retrieved successfully', {
    totalDue,
    pendingBillsCount: pendingBills.length,
    bills: pendingBills,
  });
});

// Search
export const searchPatient = catchAsync(async (req, res, next) => {
  const { q } = req.query;
  
  if (!q || q.length < 2) {
    return successResponse(res, 200, 'Search results', []);
  }

  const searchRegex = new RegExp(q, 'i');
  const results = [];

  // Search in reports
  const reports = await Report.find({
    patient: req.user.patientProfile._id,
    $or: [
      { reportId: searchRegex },
      { findings: searchRegex },
      { diagnosis: searchRegex }
    ]
  }).limit(5).populate('test', 'testName');

  reports.forEach(report => {
    results.push({
      type: 'report',
      title: report.reportId,
      description: `${report.test?.testName || 'Test'} - ${report.status}`,
      id: report._id
    });
  });

  // Search in billings
  const billings = await Billing.find({
    patient: req.user.patientProfile._id,
    $or: [
      { billId: searchRegex }
    ]
  }).limit(5);

  billings.forEach(bill => {
    results.push({
      type: 'billing',
      title: bill.billId,
      description: `Amount: $${bill.totalAmount} - ${bill.status}`,
      id: bill._id
    });
  });

  successResponse(res, 200, 'Search results', results);
});
