const mongoose = require('mongoose');

const inStoreSaleItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    sku: { type: String, required: true },
    productName: { type: String },
    size: { type: String, required: true },
    color: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const inStoreSaleSchema = new mongoose.Schema(
  {
    saleNumber: { type: String, required: true, unique: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    items: [inStoreSaleItemSchema],
    subtotal: { type: Number, required: true, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'StoreUser', required: true },
    customerName: { type: String, trim: true },
    customerEmail: { type: String, trim: true, lowercase: true },
    customerPhone: { type: String, trim: true },
  },
  { timestamps: true }
);

inStoreSaleSchema.pre('validate', function (next) {
  if (this.isNew && !this.saleNumber) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    this.saleNumber = `SALE-${timestamp}-${random}`;
  }
  next();
});

module.exports = mongoose.model('InStoreSale', inStoreSaleSchema);
