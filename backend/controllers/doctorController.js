import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Report from '../models/Report.js';
import Salary from '../models/Salary.js';
import User from '../models/User.js';
import Test from '../models/Test.js';
import Announcement from '../models/Announcement.js';
import { catchAsync, AppError } from '../utils/errorHandler.js';
import { successResponse, paginatedResponse } from '../utils/response.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';

// Get doctor profile
export const getProfile = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.findOne({ user: req.user._id })
    .populate('user', '-password -refreshToken')
    .populate('assignedPatients');

  if (!doctor) {
    return next(new AppError('Doctor profile not found', 404));
  }

  successResponse(res, 200, 'Profile retrieved successfully', doctor);
});

// Update doctor profile
export const updateProfile = catchAsync(async (req, res, next) => {
  const allowedFields = [
    'specialization',
    'qualification',
    'experience',
    'department',
    'consultationFee',
    'availability',
  ];

  const updates = {};
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  const doctor = await Doctor.findOneAndUpdate(
    { user: req.user._id },
    updates,
    { new: true, runValidators: true }
  ).populate('user', '-password -refreshToken');

  if (!doctor) {
    return next(new AppError('Doctor profile not found', 404));
  }

  successResponse(res, 200, 'Profile updated successfully', doctor);
});

// Search patients by full name
export const searchPatients = catchAsync(async (req, res, next) => {
  const { search } = req.query;

  if (!search || search.trim().length < 2) {
    return next(new AppError('Please provide at least 2 characters to search', 400));
  }

  // Search in User model for firstName and lastName
  const users = await User.find({
    role: 'patient',
    $or: [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      {
        $expr: {
          $regexMatch: {
            input: { $concat: ['$firstName', ' ', '$lastName'] },
            regex: search,
            options: 'i',
          },
        },
      },
    ],
  }).select('_id firstName lastName email phone');

  const userIds = users.map(u => u._id);

  const patients = await Patient.find({ user: { $in: userIds } })
    .populate('user', 'firstName lastName email phone')
    .populate('assignedDoctor', 'firstName lastName specialization')
    .limit(20);

  successResponse(res, 200, 'Patients retrieved successfully', patients);
});

// Get assigned patients
export const getAssignedPatients = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) {
    return next(new AppError('Doctor profile not found', 404));
  }

  const patients = await Patient.find({ assignedDoctor: doctor._id })
    .populate('user', 'firstName lastName email phone')
    .sort({ createdAt: -1 });

  successResponse(res, 200, 'Assigned patients retrieved successfully', patients);
});

// Upload report
export const uploadReport = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) {
    return next(new AppError('Doctor profile not found', 404));
  }

  const { patientId, testId, findings, diagnosis, recommendations, results, notes } = req.body;

  // Verify patient exists
  const patient = await Patient.findById(patientId);
  if (!patient) {
    return next(new AppError('Patient not found', 404));
  }

  // Handle file uploads if any
  let attachments = [];
  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map(file => uploadToCloudinary(file, 'reports'));
    const uploadedFiles = await Promise.all(uploadPromises);
    
    attachments = uploadedFiles.map(file => ({
      fileName: file.publicId,
      fileUrl: file.url,
      fileType: file.format,
    }));
  }

  // Create report
  const report = await Report.create({
    patient: patientId,
    doctor: doctor._id,
    test: testId,
    findings,
    diagnosis,
    recommendations,
    results: results ? JSON.parse(results) : [],
    notes,
    attachments,
    status: 'completed',
  });

  const populatedReport = await Report.findById(report._id)
    .populate({
      path: 'patient',
      populate: { path: 'user', select: 'firstName lastName email phone' }
    })
    .populate({
      path: 'doctor',
      populate: { path: 'user', select: 'firstName lastName' }
    })
    .populate('test');

  successResponse(res, 201, 'Report uploaded successfully', populatedReport);
});

// Edit report
export const editReport = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) {
    return next(new AppError('Doctor profile not found', 404));
  }

  const report = await Report.findOne({
    _id: req.params.id,
    doctor: doctor._id,
  });

  if (!report) {
    return next(new AppError('Report not found or unauthorized', 404));
  }

  const allowedFields = ['findings', 'diagnosis', 'recommendations', 'results', 'notes', 'status'];
  
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      report[key] = req.body[key];
    }
  });

  // Handle new file uploads
  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map(file => uploadToCloudinary(file, 'reports'));
    const uploadedFiles = await Promise.all(uploadPromises);
    
    const newAttachments = uploadedFiles.map(file => ({
      fileName: file.publicId,
      fileUrl: file.url,
      fileType: file.format,
    }));

    report.attachments = [...report.attachments, ...newAttachments];
  }

  await report.save();

  const updatedReport = await Report.findById(report._id)
    .populate({
      path: 'patient',
      populate: { path: 'user', select: 'firstName lastName email phone' }
    })
    .populate({
      path: 'doctor',
      populate: { path: 'user', select: 'firstName lastName' }
    })
    .populate('test');

  successResponse(res, 200, 'Report updated successfully', updatedReport);
});

// Get doctor's reports
export const getMyReports = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) {
    return next(new AppError('Doctor profile not found', 404));
  }

  const query = { doctor: doctor._id };
  
  if (req.query.status) {
    query.status = req.query.status;
  }

  const totalItems = await Report.countDocuments(query);
  const reports = await Report.find(query)
    .populate({
      path: 'patient',
      populate: { path: 'user', select: 'firstName lastName email phone' }
    })
    .populate('test')
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

// Get salary information
export const getMySalary = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) {
    return next(new AppError('Doctor profile not found', 404));
  }

  const salaries = await Salary.find({
    employee: req.user._id,
    employeeType: 'doctor',
  }).sort({ year: -1, month: -1 }).limit(12);

  successResponse(res, 200, 'Salary information retrieved successfully', {
    baseSalary: doctor.salary,
    salaryHistory: salaries,
  });
});

// Get announcements
export const getAnnouncements = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const now = new Date();

  const query = {
    isActive: true,
    startDate: { $lte: now },
    $or: [
      { endDate: null },
      { endDate: { $gte: now } },
    ],
    targetAudience: { $in: ['all', 'doctor'] },
  };

  const totalItems = await Announcement.countDocuments(query);
  const announcements = await Announcement.find(query)
    .populate('createdBy', 'firstName lastName')
    .sort({ priority: -1, startDate: -1 })
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

// Get all tests (for report creation)
export const getAllTests = catchAsync(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 100;
  
  const tests = await Test.find({ isActive: true })
    .select('testName testCode category price')
    .sort({ testName: 1 })
    .limit(limit);

  successResponse(res, 200, 'Tests retrieved successfully', tests);
});

// Search
export const searchDoctor = catchAsync(async (req, res, next) => {
  const { q } = req.query;
  
  if (!q || q.length < 2) {
    return successResponse(res, 200, 'Search results', []);
  }

  const searchRegex = new RegExp(q, 'i');
  const results = [];

  // Search in patients
  const patients = await Patient.find({
    assignedDoctor: req.user.doctorProfile._id
  }).populate('user').limit(5);

  patients.forEach(patient => {
    const fullName = `${patient.user.firstName} ${patient.user.lastName}`;
    if (searchRegex.test(fullName) || searchRegex.test(patient.patientId)) {
      results.push({
        type: 'patient',
        title: fullName,
        description: `Patient ID: ${patient.patientId}`,
        id: patient._id
      });
    }
  });

  // Search in reports
  const reports = await Report.find({
    doctor: req.user.doctorProfile._id,
    $or: [
      { reportId: searchRegex },
      { findings: searchRegex },
      { diagnosis: searchRegex }
    ]
  }).limit(5).populate('patient').populate('test', 'testName');

  reports.forEach(report => {
    results.push({
      type: 'report',
      title: report.reportId,
      description: `${report.test?.testName || 'Test'} - ${report.status}`,
      id: report._id
    });
  });

  successResponse(res, 200, 'Search results', results);
});
