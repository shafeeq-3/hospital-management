import multer from 'multer';
import path from 'path';
import { AppError } from '../utils/errorHandler.js';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = {
    image: /jpeg|jpg|png|gif|webp/,
    document: /pdf|doc|docx|txt/,
    report: /pdf|jpg|jpeg|png/,
  };

  const fileType = req.uploadType || 'document';
  const extname = allowedTypes[fileType].test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes[fileType].test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new AppError(`Invalid file type. Allowed types: ${fileType}`, 400));
  }
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter,
});

// Middleware for single file upload
export const uploadSingle = (fieldName, uploadType = 'document') => {
  return (req, res, next) => {
    req.uploadType = uploadType;
    upload.single(fieldName)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError('File size too large. Maximum size is 10MB', 400));
        }
        return next(new AppError(err.message, 400));
      } else if (err) {
        return next(err);
      }
      next();
    });
  };
};

// Middleware for multiple file upload
export const uploadMultiple = (fieldName, maxCount = 5, uploadType = 'document') => {
  return (req, res, next) => {
    req.uploadType = uploadType;
    upload.array(fieldName, maxCount)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError('File size too large. Maximum size is 10MB', 400));
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return next(new AppError(`Too many files. Maximum is ${maxCount}`, 400));
        }
        return next(new AppError(err.message, 400));
      } else if (err) {
        return next(err);
      }
      next();
    });
  };
};

export default upload;
