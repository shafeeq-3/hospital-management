import express from 'express';
import {
  register,
  login,
  getCurrentUser,
  logout,
  changePassword,
} from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validation.js';
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
} from '../validators/authValidator.js';
import { authLimiter } from '../middlewares/security.js';

const router = express.Router();

// Public routes
router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);

// Protected routes
router.use(authenticate);
router.get('/me', getCurrentUser);
router.post('/logout', logout);
router.put('/change-password', validate(changePasswordSchema), changePassword);

export default router;
