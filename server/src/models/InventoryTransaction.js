const mongoose = require('mongoose');

const inventoryTransactionSchema = new mongoose.Schema(
  {
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    sku: { type: String, required: true },
    size: { type: String, required: true },
    transactionType: {
      type: String,
      enum: ['RESERVE', 'DEDUCT', 'RELEASE', 'RESTORE', 'ROLLBACK_RESTORE', 'IN_STORE_SALE'],
      required: true,
    },
    quantity: { type: Number, required: true },
    referenceType: { type: String, enum: ['order', 'return', 'in_store_sale', 'manual'] },
    referenceId: { type: mongoose.Schema.Types.ObjectId },
    performedBy: { type: mongoose.Schema.Types.ObjectId },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

inventoryTransactionSchema.index({ storeId: 1, productId: 1 });
inventoryTransactionSchema.index({ referenceId: 1 });

module.exports = mongoose.model('InventoryTransaction', inventoryTransactionSchema);
