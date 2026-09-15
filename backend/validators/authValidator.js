import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required',
  }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match',
    'any.required': 'Please confirm your password',
  }),
  role: Joi.string().valid('patient', 'doctor', 'staff', 'admin').required().messages({
    'any.only': 'Invalid role selected',
    'any.required': 'Role is required',
  }),
  firstName: Joi.string().trim().required().messages({
    'any.required': 'First name is required',
  }),
  lastName: Joi.string().trim().required().messages({
    'any.required': 'Last name is required',
  }),
  phone: Joi.string().pattern(/^[0-9]{10,15}$/).required().messages({
    'string.pattern.base': 'Please provide a valid phone number',
    'any.required': 'Phone number is required',
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Current password is required',
  }),
  newPassword: Joi.string().min(6).required().messages({
    'string.min': 'New password must be at least 6 characters long',
    'any.required': 'New password is required',
  }),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Passwords do not match',
    'any.required': 'Please confirm your new password',
  }),
});
