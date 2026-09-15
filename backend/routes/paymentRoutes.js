import express from 'express';
import {
  createPayment,
  getPaymentById,
  getMyPayments,
} from '../controllers/paymentController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Patient routes
router.use(authenticate);
router.post('/create', authorize('patient'), createPayment);
router.get('/my-payments', authorize('patient'), getMyPayments);
router.get('/:id', authorize('patient'), getPaymentById);

export default router;
