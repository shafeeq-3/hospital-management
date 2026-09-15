import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  reportId: {
    type: String,
    unique: true,
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Patient is required'],
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: [true, 'Doctor is required'],
  },
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: [true, 'Test is required'],
  },
  testDate: {
    type: Date,
    default: Date.now,
  },
  reportDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'reviewed'],
    default: 'pending',
  },
  findings: {
    type: String,
    default: '',
  },
  results: [{
    parameter: String,
    value: String,
    unit: String,
    normalRange: String,
    status: {
      type: String,
      enum: ['normal', 'abnormal', 'critical'],
      default: 'normal',
    },
  }],
  diagnosis: {
    type: String,
    default: '',
  },
  recommendations: {
    type: String,
    default: '',
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  notes: {
    type: String,
    default: '',
  },
  isDownloaded: {
    type: Boolean,
    default: false,
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
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Generate unique report ID
reportSchema.pre('save', async function(next) {
  if (this.isNew && !this.reportId) {
    const count = await mongoose.model('Report').countDocuments();
    this.reportId = `RPT${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Index for efficient searching
reportSchema.index({ patient: 1, testDate: -1 });
reportSchema.index({ doctor: 1, status: 1 });

const Report = mongoose.model('Report', reportSchema, 'hospital_reports');

export default Report;
