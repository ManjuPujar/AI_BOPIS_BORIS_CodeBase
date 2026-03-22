const mongoose = require('mongoose');

const returnItemSchema = new mongoose.Schema(
  {
    returnId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Return',
      required: true,
      index: true,
    },
    orderItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OrderItem',
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    sku: { type: String, required: true, trim: true },
    productName: { type: String, required: true, trim: true },
    size: { type: String, required: true, trim: true },
    color: { type: String, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    condition: {
      type: String,
      enum: ['unopened', 'like_new', 'damaged'],
      default: 'like_new',
    },
  },
  { timestamps: true }
);

returnItemSchema.index({ returnId: 1 });

module.exports = mongoose.model('ReturnItem', returnItemSchema);
