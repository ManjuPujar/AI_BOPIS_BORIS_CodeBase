const mongoose = require('mongoose');

const orderStatusHistorySchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    fromStatus: { type: String },
    toStatus: { type: String, required: true },
    changedBy: {
      userType: {
        type: String,
        enum: ['customer', 'store_employee', 'system', 'guest'],
      },
      userId: { type: mongoose.Schema.Types.ObjectId },
    },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

orderStatusHistorySchema.index({ orderId: 1 });

module.exports = mongoose.model('OrderStatusHistory', orderStatusHistorySchema);
