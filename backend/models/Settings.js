import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  hospitalName: {
    type: String,
    default: 'MediCare Hospital',
  },
  hospitalEmail: {
    type: String,
    default: 'admin@medicare.com',
  },
  hospitalPhone: {
    type: String,
    default: '+1234567890',
  },
  address: {
    type: String,
    default: '123 Medical Street, Healthcare City',
  },
  timezone: {
    type: String,
    default: 'Asia/Karachi',
  },
  currency: {
    type: String,
    default: 'PKR',
  },
  emailNotifications: {
    type: Boolean,
    default: true,
  },
  smsNotifications: {
    type: Boolean,
    default: false,
  },
  backupFrequency: {
    type: String,
    enum: ['hourly', 'daily', 'weekly', 'monthly'],
    default: 'daily',
  },
  dataRetention: {
    type: Number,
    default: 365,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

const Settings = mongoose.model('Settings', settingsSchema, 'hospital_settings');

export default Settings;
