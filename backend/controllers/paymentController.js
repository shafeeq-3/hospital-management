import Payment from '../models/Payment.js';
import Billing from '../models/Billing.js';
import Patient from '../models/Patient.js';
import { catchAsync, AppError } from '../utils/errorHandler.js';
import { successResponse } from '../utils/response.js';

// Create simulated payment
export const createPayment = catchAsync(async (req, res, next) => {
  const { billingId, amount, paymentMethod, cardDetails } = req.body;

  // Verify patient
  const patient = await Patient.findOne({ user: req.user._id });
  if (!patient) {
    return next(new AppError('Patient profile not found', 404));
  }

  // Verify billing
  const billing = await Billing.findOne({
    _id: billingId,
    patient: patient._id,
  });

  if (!billing) {
    return next(new AppError('Billing record not found', 404));
  }

  if (billing.paymentStatus === 'paid') {
    return next(new AppError('This bill has already been paid', 400));
  }

  // Validate amount
  if (amount > billing.dueAmount) {
    return next(new AppError('Payment amount exceeds due amount', 400));
  }

  if (amount <= 0) {
    return next(new AppError('Invalid payment amount', 400));
  }

  // Generate transaction ID
  const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  // Create payment record
  const payment = await Payment.create({
    patient: patient._id,
    billing: billing._id,
    amount,
    paymentMethod: paymentMethod || 'card',
    paymentStatus: 'completed',
    transactionId,
    cardDetails: cardDetails || null,
    paymentDate: new Date(),
  });

  // Update billing
  billing.paidAmount += payment.amount;
  billing.dueAmount = billing.totalAmount - billing.paidAmount;

  if (billing.dueAmount <= 0) {
    billing.paymentStatus = 'paid';
    billing.status = 'paid';
  } else {
    billing.paymentStatus = 'partially-paid';
  }

  await billing.save();

  // Update patient total due
  const allPendingBills = await Billing.find({
    patient: patient._id,
    paymentStatus: { $in: ['unpaid', 'partially-paid'] },
  });
  patient.totalAmountDue = allPendingBills.reduce((sum, bill) => sum + bill.dueAmount, 0);
  await patient.save();

  successResponse(res, 201, 'Payment processed successfully', payment);
});

// Get payment by ID
export const getPaymentById = catchAsync(async (req, res, next) => {
  const patient = await Patient.findOne({ user: req.user._id });
  if (!patient) {
    return next(new AppError('Patient profile not found', 404));
  }

  const payment = await Payment.findOne({
    _id: req.params.id,
    patient: patient._id,
  }).populate('billing');

  if (!payment) {
    return next(new AppError('Payment not found', 404));
  }

  successResponse(res, 200, 'Payment retrieved successfully', payment);
});

// Get all payments for patient
export const getMyPayments = catchAsync(async (req, res, next) => {
  const patient = await Patient.findOne({ user: req.user._id });
  if (!patient) {
    return next(new AppError('Patient profile not found', 404));
  }

  const payments = await Payment.find({ patient: patient._id })
    .populate('billing')
    .sort({ paymentDate: -1 });

  successResponse(res, 200, 'Payments retrieved successfully', payments);
});
