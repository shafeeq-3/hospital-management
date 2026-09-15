import mongoose from 'mongoose';

const billingSchema = new mongoose.Schema({
  billId: {
    type: String,
    unique: true,
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Patient is required'],
  },
  items: [{
    itemType: {
      type: String,
      enum: ['test', 'consultation', 'procedure', 'medication', 'other'],
      required: true,
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'items.itemType',
    },
    description: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  }],
  subtotal: {
    type: Number,
    required: true,
    min: 0,
  },
  tax: {
    type: Number,
    default: 0,
    min: 0,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'partially-paid', 'paid', 'cancelled', 'refunded'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'partially-paid', 'refunded'],
    default: 'unpaid',
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  dueAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  billDate: {
    type: Date,
    default: Date.now,
  },
  dueDate: {
    type: Date,
    required: true,
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

// Generate unique bill ID
billingSchema.pre('save', async function(next) {
  if (this.isNew && !this.billId) {
    const count = await mongoose.model('Billing').countDocuments();
    this.billId = `BILL${String(count + 1).padStart(6, '0')}`;
  }
  
  // Calculate due amount
  this.dueAmount = this.totalAmount - this.paidAmount;
  
  // Update payment status based on amounts
  if (this.paidAmount === 0) {
    this.paymentStatus = 'unpaid';
  } else if (this.paidAmount >= this.totalAmount) {
    this.paymentStatus = 'paid';
  } else {
    this.paymentStatus = 'partially-paid';
  }
  
  next();
});

// Index for efficient querying
billingSchema.index({ patient: 1, billDate: -1 });
billingSchema.index({ status: 1, paymentStatus: 1 });

const Billing = mongoose.model('Billing', billingSchema, 'hospital_billings');

export default Billing;
