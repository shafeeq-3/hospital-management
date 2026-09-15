import mongoose from 'mongoose';

const salarySchema = new mongoose.Schema({
  salaryId: {
    type: String,
    unique: true,
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Employee is required'],
  },
  employeeType: {
    type: String,
    enum: ['doctor', 'staff'],
    required: true,
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12,
  },
  year: {
    type: Number,
    required: true,
  },
  baseSalary: {
    type: Number,
    required: [true, 'Base salary is required'],
    min: 0,
  },
  allowances: {
    type: Number,
    default: 0,
    min: 0,
  },
  bonuses: {
    type: Number,
    default: 0,
    min: 0,
  },
  deductions: {
    type: Number,
    default: 0,
    min: 0,
  },
  netSalary: {
    type: Number,
    required: true,
    min: 0,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'paid', 'on-hold'],
    default: 'pending',
  },
  paymentDate: {
    type: Date,
    default: null,
  },
  paymentMethod: {
    type: String,
    enum: ['bank-transfer', 'cash', 'cheque'],
    default: 'bank-transfer',
  },
  notes: {
    type: String,
    default: '',
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

// Generate unique salary ID
salarySchema.pre('save', async function(next) {
  if (this.isNew && !this.salaryId) {
    const count = await mongoose.model('Salary').countDocuments();
    this.salaryId = `SAL${String(count + 1).padStart(6, '0')}`;
  }
  
  // Calculate net salary
  this.netSalary = this.baseSalary + this.allowances + this.bonuses - this.deductions;
  
  next();
});

// Compound index to prevent duplicate salary records for same employee in same month
salarySchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

const Salary = mongoose.model('Salary', salarySchema, 'hospital_salaries');

export default Salary;
