const mongoose = require('mongoose');

const RETURN_STATUSES = [
  'RETURN_REQUESTED',
  'RETURN_ACCEPTED',
  'RETURN_COMPLETED',
  'RETURN_REJECTED',
];

const returnSchema = new mongoose.Schema(
  {
    returnNumber: { type: String, required: true, unique: true },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
    status: {
      type: String,
      enum: RETURN_STATUSES,
      default: 'RETURN_REQUESTED',
    },
    reason: { type: String, required: true, trim: true },
    notes: { type: String, trim: true },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StoreUser',
    },
    processedAt: { type: Date },
    refundAmount: { type: Number, min: 0 },
  },
  { timestamps: true }
);

returnSchema.index({ orderId: 1 });
returnSchema.index({ customerId: 1 });

returnSchema.pre('validate', function (next) {
  if (this.isNew && !this.returnNumber) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    this.returnNumber = `RET-${timestamp}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Return', returnSchema);
