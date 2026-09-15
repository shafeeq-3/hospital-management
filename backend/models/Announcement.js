import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  announcementId: {
    type: String,
    unique: true,
  },
  title: {
    type: String,
    required: [true, 'Announcement title is required'],
    trim: true,
  },
  message: {
    type: String,
    required: [true, 'Announcement message is required'],
  },
  type: {
    type: String,
    enum: ['general', 'urgent', 'maintenance', 'event', 'policy'],
    default: 'general',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  targetAudience: [{
    type: String,
    enum: ['all', 'patient', 'doctor', 'staff', 'admin'],
    default: 'all',
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
    default: null,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
  }],
  viewedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    viewedAt: {
      type: Date,
      default: Date.now,
    },
  }],
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

// Generate unique announcement ID
announcementSchema.pre('save', async function(next) {
  if (this.isNew && !this.announcementId) {
    const count = await mongoose.model('Announcement').countDocuments();
    this.announcementId = `ANN${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Index for efficient querying
announcementSchema.index({ isActive: 1, startDate: -1 });
announcementSchema.index({ targetAudience: 1 });

const Announcement = mongoose.model('Announcement', announcementSchema, 'hospital_announcements');

export default Announcement;
