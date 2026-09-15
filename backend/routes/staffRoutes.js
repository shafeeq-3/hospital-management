import express from 'express';
import {
  getProfile,
  updateProfile,
  getMySalary,
  getAnnouncements,
  markAnnouncementViewed,
  getShiftSchedule,
  searchStaff,
} from '../controllers/staffController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication and staff role
router.use(authenticate, authorize('staff'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/salary', getMySalary);
router.get('/announcements', getAnnouncements);
router.post('/announcements/:id/view', markAnnouncementViewed);
router.get('/shift-schedule', getShiftSchedule);
router.get('/search', searchStaff);

export default router;
