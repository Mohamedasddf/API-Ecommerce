const Cart = require("../models/cart");
const Product = require("../models/product");
const User = require("../models/Users");
const mongoose = require('mongoose');

/**
 * @desc    إضافة منتج إلى السلة
 * @route   POST /api/cart/:id
 * @access  Private (Authenticated User)
 */
const addCart = async (req, res) => {
  try {
    const user = await User.findById(req.user);
    const isAdmin = user ? (user.role === "admin") : false;

    if (!user._id && !isAdmin) {
        return res.status(403).json({ message: "You are not authorized to add cart" });
    }

    const { id } = req.params;  // معرف المنتج
    const { quantity, color } = req.body;

    if (!quantity || !color) {
      return res.status(400).json({ message: "جميع الحقول مطلوبة" });
    }

    if (isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ message: "يجب أن تكون الكمية رقمًا إيجابيًا" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'المنتج غير موجود' });
    }

    if (!product.colors.includes(color)) {
      return res.status(400).json({ message: `اللون ${color} غير متاح لهذا المنتج` });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: 'لا يوجد مخزون كافٍ' });
    }

    const cartItem = await Cart.create({
      user: user._id,
      productId: product._id,
      quantity: quantity,
      color: color
    });

    product.stock -= quantity;
    await product.save();

    res.status(201).json({
      message: `تم إضافة المنتج إلى السلة: ${product.name} بالكمية ${quantity} واللون ${color}`,
      cartItem
    });
  } catch (err) {
    res.status(500).json({ message: 'حدث خطأ أثناء إضافة المنتج إلى السلة', error: err });
  }
};

/**
 * @desc    حذف منتج من السلة
 * @route   DELETE /api/cart/:id
 * @access  Private (Authenticated User)
 */
const deleteCart = async (req, res) => {
  try {
    const user = await User.findById(req.user);
    const isAdmin = user ? (user.role === "admin") : false;

    if (!user._id && !isAdmin) {
        return res.status(403).json({ message: "You are not authorized to delete of cart" });
    }

    const cartItem = await Cart.findByIdAndDelete(req.params.id);
    if (!cartItem) {
      return res.status(404).json({ message: 'لم يتم العثور على هذا المنتج في السلة' });
    }

    const product = await Product.findById(cartItem.productId);
    if (product) {
      product.stock += cartItem.quantity;
      await product.save();
    }

    res.status(200).json({ message: 'تم حذف المنتج من السلة' });
  } catch (err) {
    res.status(500).json({ message: 'حدث خطأ أثناء حذف المنتج من السلة', error: err });
  }
};

/**
 * @desc    تحديث منتج في السلة
 * @route   PUT /api/cart/:id
 * @access  Private (Authenticated User)
 */
const updateCart = async (req, res) => {  
  try {
    const user = await User.findById(req.user);
    const isAdmin = user ? (user.role === "admin") : false;

    if (!user._id && !isAdmin) {
        return res.status(403).json({ message: "You are not authorized to update in cart" });
    }

    const { quantity, color } = req.body;
    if (!quantity || !color) {
      return res.status(400).json({ message: "يجب تحديد الكمية واللون" });
    }

    const cartItem = await Cart.findById(req.params.id);
    if (!cartItem) return res.status(404).json({ message: 'لم يتم العثور على هذا المنتج في السلة' });

    const product = await Product.findById(cartItem.productId);
    if (!product) return res.status(404).json({ message: 'المنتج غير موجود' });

    if (product.stock < quantity) {
      return res.status(400).json({ message: 'الكمية المطلوبة غير متوفرة في المخزون' });
    }

    cartItem.quantity = quantity;
    cartItem.color = color;
    await cartItem.save();

    res.status(200).json({ message: 'تم تحديث المنتج في السلة', cartItem });
  } catch (err) {
    res.status(500).json({ message: 'حدث خطأ أثناء تحديث المنتج في السلة', error: err });
  }
};

/**
 * @desc    الحصول على محتويات السلة
 * @route   GET /api/cart
 * @access  Private (Authenticated User)
 */
const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user);
    const isAdmin = user ? (user.role === "admin") : false;

    if (!user._id && !isAdmin) {
        return res.status(403).json({ message: "You are not authorized to get this cart" });
    }


    const cartItems = await Cart.find({ user: user._id })
      .populate({
        path: 'productId', 
        select: 'name description price colors' 
      })
      .exec();

    if (!cartItems.length) {
      return res.status(404).json({ message: "السلة فارغة" });
    }

    const result = cartItems.map(item => ({
      productName: item.productId.name,
      productDescription: item.productId.description,
      productColor: item.color,
      quantity: item.quantity,
      price: item.productId.price,
      totalPrice: item.quantity * item.productId.price  // حساب المجموع
    }));

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: 'حدث خطأ أثناء جلب بيانات السلة', error: err });
  }
};

module.exports = { addCart, deleteCart, updateCart, getCart };
