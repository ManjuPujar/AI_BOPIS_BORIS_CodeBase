const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, trim: true },
    brand: { type: String, default: 'Converse', trim: true },
    category: { type: String, trim: true },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    basePrice: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0 },
    images: [{ type: String }],
    sizes: [
      {
        size: { type: String },
        sizeLabel: { type: String },
      },
    ],
    colors: [
      {
        name: { type: String },
        hex: { type: String },
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
