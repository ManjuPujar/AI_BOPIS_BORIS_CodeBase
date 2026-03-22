const mongoose = require('mongoose');

const digitalInventorySchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    sku: { type: String, required: true, trim: true },
    size: { type: String, required: true, trim: true },
    color: { type: String, trim: true },
    quantityOnHand: { type: Number, default: 0, min: 0 },
    quantityReserved: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

digitalInventorySchema.virtual('quantityAvailable').get(function () {
  return this.quantityOnHand - this.quantityReserved;
});

digitalInventorySchema.index(
  { productId: 1, sku: 1, size: 1 },
  { unique: true }
);

module.exports = mongoose.model('DigitalInventory', digitalInventorySchema);
