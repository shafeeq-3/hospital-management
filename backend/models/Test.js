import mongoose from 'mongoose';

const testSchema = new mongoose.Schema({
  testCode: {
    type: String,
    unique: true,
  },
  testName: {
    type: String,
    required: [true, 'Test name is required'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Test category is required'],
    enum: ['Blood Test', 'Urine Test', 'Imaging', 'Pathology', 'Radiology', 'Cardiology', 'Other'],
  },
  description: {
    type: String,
    required: [true, 'Test description is required'],
  },
  price: {
    type: Number,
    required: [true, 'Test price is required'],
    min: 0,
  },
  duration: {
    type: String,
    required: [true, 'Test duration is required'],
  },
  preparationInstructions: {
    type: String,
    default: 'No special preparation required',
  },
  normalRange: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
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

// Generate unique test code
testSchema.pre('save', async function(next) {
  if (this.isNew && !this.testCode) {
    const count = await mongoose.model('Test').countDocuments();
    this.testCode = `TST${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

const Test = mongoose.model('Test', testSchema, 'hospital_tests');

export default Test;
