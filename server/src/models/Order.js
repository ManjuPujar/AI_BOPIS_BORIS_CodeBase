const mongoose = require('mongoose');
const { ORDER_STATUSES } = require('../../../shared/orderStatuses');

const shippingAddressSchema = new mongoose.Schema(
  {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zipcode: { type: String, trim: true },
    country: { type: String, default: 'US', trim: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      index: true,
    },
    customerEmail: { type: String, trim: true, lowercase: true, index: true },
    customerName: { type: String, trim: true },
    customerPhone: { type: String, trim: true },
    isGuest: { type: Boolean, default: false },
    guestEmail: { type: String, trim: true, lowercase: true },
    guestPhone: { type: String, trim: true },
    guestFirstName: { type: String, trim: true },
    guestLastName: { type: String, trim: true },
    deliveryMethod: {
      type: String,
      enum: ['SHIP_TO_ME', 'SHIP_TO_STORE'],
      required: true,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUSES),
      default: ORDER_STATUSES.PLACED,
      index: true,
    },
    shippingAddress: shippingAddressSchema,
    subtotal: { type: Number, required: true, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    pickupReadyTime: { type: Date },
    pickupCompletedTime: { type: Date },
    notes: { type: String, trim: true },
    cancelReason: { type: String, trim: true },
    pickupOtpHash: { type: String, select: false },
    pickupOtpPlain: { type: String, select: false },
    otpGeneratedAt: { type: Date },
    otpExpiresAt: { type: Date },
    otpVerifiedAt: { type: Date },
    otpVerificationStatus: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'EXPIRED'],
      default: null,
    },
    otpAttempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

orderSchema.pre('validate', function (next) {
  if (this.isNew && !this.orderNumber) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }
  if (this.deliveryMethod === 'SHIP_TO_STORE' && !this.storeId) {
    this.invalidate('storeId', 'Store is required for SHIP_TO_STORE orders');
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
