const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
  appliedCoupon: { type: mongoose.Types.ObjectId, ref: 'Coupon', default: null },
  products: [
    {
      productId: { type: mongoose.Types.ObjectId, required: true, ref: 'Product' },
      quantity: { type: Number, required: true },
      color: [{ type: String, required: true }],
      total: { type: Number, required: true },
    },
  ],
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'cancelled', 'delivered'], 
    default: 'pending' 
  },
}, { timestamps: true });

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
