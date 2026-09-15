import Staff from '../models/Staff.js';
import Salary from '../models/Salary.js';
import Announcement from '../models/Announcement.js';
import { catchAsync, AppError } from '../utils/errorHandler.js';
import { successResponse } from '../utils/response.js';

// Get staff profile
export const getProfile = catchAsync(async (req, res, next) => {
  const staff = await Staff.findOne({ user: req.user._id })
    .populate('user', '-password -refreshToken');

  if (!staff) {
    return next(new AppError('Staff profile not found', 404));
  }

  successResponse(res, 200, 'Profile retrieved successfully', staff);
});

// Update staff profile
export const updateProfile = catchAsync(async (req, res, next) => {
  const allowedFields = ['position', 'department', 'shift'];

  const updates = {};
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  const staff = await Staff.findOneAndUpdate(
    { user: req.user._id },
    updates,
    { new: true, runValidators: true }
  ).populate('user', '-password -refreshToken');

  if (!staff) {
    return next(new AppError('Staff profile not found', 404));
  }

  successResponse(res, 200, 'Profile updated successfully', staff);
});

// Get salary information
export const getMySalary = catchAsync(async (req, res, next) => {
  const staff = await Staff.findOne({ user: req.user._id });
  if (!staff) {
    return next(new AppError('Staff profile not found', 404));
  }

  const salaries = await Salary.find({
    employee: req.user._id,
    employeeType: 'staff',
  }).sort({ year: -1, month: -1 }).limit(12);

  successResponse(res, 200, 'Salary information retrieved successfully', {
    baseSalary: staff.salary,
    salaryHistory: salaries,
  });
});

// Get announcements
export const getAnnouncements = catchAsync(async (req, res, next) => {
  const now = new Date();

  const announcements = await Announcement.find({
    isActive: true,
    startDate: { $lte: now },
    $or: [
      { endDate: null },
      { endDate: { $gte: now } },
    ],
    targetAudience: { $in: ['all', 'staff'] },
  })
    .populate('createdBy', 'firstName lastName')
    .sort({ priority: -1, startDate: -1 });

  successResponse(res, 200, 'Announcements retrieved successfully', announcements);
});

// Mark announcement as viewed
export const markAnnouncementViewed = catchAsync(async (req, res, next) => {
  const announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    return next(new AppError('Announcement not found', 404));
  }

  // Check if already viewed
  const alreadyViewed = announcement.viewedBy.some(
    view => view.user.toString() === req.user._id.toString()
  );

  if (!alreadyViewed) {
    announcement.viewedBy.push({
      user: req.user._id,
      viewedAt: new Date(),
    });
    await announcement.save();
  }

  successResponse(res, 200, 'Announcement marked as viewed');
});

// Get shift schedule
export const getShiftSchedule = catchAsync(async (req, res, next) => {
  const staff = await Staff.findOne({ user: req.user._id });
  if (!staff) {
    return next(new AppError('Staff profile not found', 404));
  }

  // Get upcoming shifts (next 30 days)
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + 30);

  const upcomingShifts = staff.shiftSchedule.filter(shift => {
    const shiftDate = new Date(shift.date);
    return shiftDate >= today && shiftDate <= futureDate;
  }).sort((a, b) => new Date(a.date) - new Date(b.date));

  successResponse(res, 200, 'Shift schedule retrieved successfully', {
    currentShift: staff.shift,
    upcomingShifts,
  });
});

// Search
export const searchStaff = catchAsync(async (req, res, next) => {
  const { q } = req.query;
  
  if (!q || q.length < 2) {
    return successResponse(res, 200, 'Search results', []);
  }

  const searchRegex = new RegExp(q, 'i');
  const results = [];

  // Search in announcements
  const announcements = await Announcement.find({
    isActive: true,
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
