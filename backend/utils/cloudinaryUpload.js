import cloudinary from '../config/cloudinary.js';
import { AppError } from './errorHandler.js';

// Upload file to Cloudinary
export const uploadToCloudinary = async (file, folder = 'hospital-management') => {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'auto',
          transformation: [
            { quality: 'auto' },
            { fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) {
            reject(new AppError('File upload failed', 500));
          } else {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              format: result.format,
              size: result.bytes,
            });
          }
        }
      );

      uploadStream.end(file.buffer);
    });
  } catch (error) {
    throw new AppError('Error uploading file to cloud storage', 500);
  }
};

// Delete file from Cloudinary
export const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
  }
};

// Upload multiple files
export const uploadMultipleToCloudinary = async (files, folder = 'hospital-management') => {
  try {
    const uploadPromises = files.map(file => uploadToCloudinary(file, folder));
    return await Promise.all(uploadPromises);
  } catch (error) {
    throw new AppError('Error uploading multiple files', 500);
  }
};
