/**
 * @desc    إدارة المنتجات (إنشاء، عرض، تعديل، حذف)
 * @route   API Routes
 * @access  بعض العمليات خاصة بالمستخدمين الموثقين فقط
 */

const express = require('express');
const router = express.Router();
const isAuthenticated = require("../Middleware/verifyJWT");
const {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct
} = require('../controllers/productContoller');

/**
 * @route   POST /api/products/
 * @desc    إنشاء منتج جديد
 * @access  Private (يتطلب التوثيق)
 */
router.post('/', isAuthenticated, createProduct);

/**
 * @route   GET /api/products/
 * @desc    جلب جميع المنتجات
 * @access  Public
 */
router.get('/', getAllProducts);

/**
 * @route   GET /api/products/:id
 * @desc    جلب منتج محدد عبر الـ ID
 * @access  Public
 */
router.get('/:id', getProductById);

/**
 * @route   PUT /api/products/:id
 * @desc    تحديث بيانات منتج محدد
 * @access  Private (يتطلب التوثيق)
 */
router.put('/:id', isAuthenticated, updateProduct);

/**
 * @route   DELETE /api/products/:id
 * @desc    حذف منتج محدد
 * @access  Private (يتطلب التوثيق)
 */
router.delete('/:id', isAuthenticated, deleteProduct);

// تصدير الراوتر
module.exports = router;
