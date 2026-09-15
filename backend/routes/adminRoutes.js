import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  createTest,
  getAllTests,
  updateTest,
  deleteTest,
  assignSalary,
  updateSalaryStatus,
  getAllSalaries,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getAllAnnouncements,
  getAllPayments,
  getSettings,
  updateSettings,
  searchAdmin,
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate, authorize('admin'));

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// User Management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Test Management
router.post('/tests', createTest);
router.get('/tests', getAllTests);
router.put('/tests/:id', updateTest);
router.delete('/tests/:id', deleteTest);

// Salary Management
router.post('/salaries', assignSalary);
router.put('/salaries/:id', updateSalaryStatus);
router.get('/salaries', getAllSalaries);

// Announcement Management
router.post('/announcements', createAnnouncement);
router.put('/announcements/:id', updateAnnouncement);
router.delete('/announcements/:id', deleteAnnouncement);
router.get('/announcements', getAllAnnouncements);

// Payment Management
router.get('/payments', getAllPayments);

// Settings Management
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

// Search
router.get('/search', searchAdmin);

export default router;
