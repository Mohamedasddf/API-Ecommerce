const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Types.ObjectId, required: true, ref: 'User' }, // Reference to the User model
  productId: { type: mongoose.Types.ObjectId, required: true, ref: 'Product' }, // Reference to the Product model
  quantity: { type: Number, required: true, min: 1 },  // Quantity of the product
  color: [{type: String}]
});

// Pre-hooks for populating the productId field
cartSchema.pre('findOne', function (next) {
    this.populate('productId');
    next();
});

cartSchema.pre('findById', function (next) {
    this.populate('productId');
    next();
});

cartSchema.pre('find', function (next) {
    this.populate('productId');
    next();
});

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
