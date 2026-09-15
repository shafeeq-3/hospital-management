import express from 'express';
import {
  getProfile,
  updateProfile,
  searchPatients,
  getAssignedPatients,
  uploadReport,
  editReport,
  getMyReports,
  getMySalary,
  getAllTests,
  getAnnouncements,
  searchDoctor,
} from '../controllers/doctorController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { uploadMultiple } from '../middlewares/upload.js';

const router = express.Router();

// All routes require authentication and doctor role
router.use(authenticate, authorize('doctor'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/patients/search', searchPatients);
router.get('/patients/assigned', getAssignedPatients);
router.post('/reports', uploadMultiple('attachments', 5, 'report'), uploadReport);
router.put('/reports/:id', uploadMultiple('attachments', 5, 'report'), editReport);
router.get('/reports', getMyReports);
router.get('/salary', getMySalary);
router.get('/tests', getAllTests);
router.get('/announcements', getAnnouncements);
router.get('/search', searchDoctor);

export default router;
