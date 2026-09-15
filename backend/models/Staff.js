import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  staffId: {
    type: String,
    unique: true,
  },
  position: {
    type: String,
    required: [true, 'Position is required'],
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
  },
  employeeType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract'],
    default: 'full-time',
  },
  salary: {
    type: Number,
    default: 0,
  },
  shift: {
    type: String,
    enum: ['morning', 'evening', 'night', 'rotating'],
    default: 'morning',
  },
  shiftSchedule: [{
    date: Date,
    shift: {
      type: String,
      enum: ['morning', 'evening', 'night', 'off'],
    },
    startTime: String,
    endTime: String,
  }],
  joiningDate: {
    type: Date,
    default: Date.now,
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

// Generate unique staff ID
staffSchema.pre('save', async function(next) {
  if (this.isNew && !this.staffId) {
    const count = await mongoose.model('Staff').countDocuments();
    this.staffId = `STF${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

const Staff = mongoose.model('Staff', staffSchema, 'hospital_staff');

export default Staff;
