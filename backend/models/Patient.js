import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  patientId: {
    type: String,
    unique: true,
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required'],
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: [true, 'Gender is required'],
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
  },
  medicalHistory: [{
    condition: String,
    diagnosedDate: Date,
    notes: String,
  }],
  allergies: [String],
  currentMedications: [String],
  assignedDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    default: null,
  },
  totalAmountDue: {
    type: Number,
    default: 0,
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

// Virtual for age calculation
patientSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Generate unique patient ID
patientSchema.pre('save', async function(next) {
  if (this.isNew && !this.patientId) {
    const count = await mongoose.model('Patient').countDocuments();
    this.patientId = `PAT${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

const Patient = mongoose.model('Patient', patientSchema, 'hospital_patients');
export default Patient;
