import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  doctorId: {
    type: String,
    unique: true,
  },
  specialization: {
    type: String,
    required: [true, 'Specialization is required'],
  },
  qualification: {
    type: String,
    required: [true, 'Qualification is required'],
  },
  experience: {
    type: Number,
    required: [true, 'Years of experience is required'],
    min: 0,
  },
  licenseNumber: {
    type: String,
    required: [true, 'Medical license number is required'],
    unique: true,
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
  },
  consultationFee: {
    type: Number,
    default: 0,
  },
  availability: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    startTime: String,
    endTime: String,
  }],
  assignedPatients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
  }],
  salary: {
    type: Number,
    default: 0,
  },
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

// Generate unique doctor ID
doctorSchema.pre('save', async function(next) {
  if (this.isNew && !this.doctorId) {
    const count = await mongoose.model('Doctor').countDocuments();
    this.doctorId = `DOC${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

const Doctor = mongoose.model('Doctor', doctorSchema, 'hospital_doctors');

export default Doctor;
