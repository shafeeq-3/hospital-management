import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    unique: true,
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Patient is required'],
  },
  billing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Billing',
    required: [true, 'Billing reference is required'],
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: 0,
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'cash', 'bank-transfer', 'insurance', 'other'],
    default: 'card',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'completed',
  },
  transactionId: {
    type: String,
    required: true,
  },
  cardDetails: {
    last4: String,
    brand: String,
    expiryMonth: Number,
    expiryYear: Number,
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
    default: '',
  },
  metadata: {
    type: Map,
    of: String,
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

// Generate unique payment ID
paymentSchema.pre('save', async function(next) {
  if (this.isNew && !this.paymentId) {
    const count = await mongoose.model('Payment').countDocuments();
    this.paymentId = `PAY${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Index for efficient querying
paymentSchema.index({ patient: 1, paymentDate: -1 });
paymentSchema.index({ billing: 1 });
paymentSchema.index({ paymentStatus: 1 });

const Payment = mongoose.model('Payment', paymentSchema, 'hospital_payments');

export default Payment;
