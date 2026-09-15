import express from 'express';
import {
  getProfile,
  updateProfile,
  getMyReports,
  getReportById,
  getMyBillings,
  getMyPayments,
  getTotalDue,
  searchPatient,
} from '../controllers/patientController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication and patient role
router.use(authenticate, authorize('patient'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/reports', getMyReports);
router.get('/reports/:id', getReportById);
router.get('/billings', getMyBillings);
router.get('/payments', getMyPayments);
router.get('/total-due', getTotalDue);
router.get('/search', searchPatient);

export default router;
