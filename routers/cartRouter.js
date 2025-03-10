/**
 * @desc    إدارة عربة التسوق (إضافة، تحديث، حذف، واستعراض العناصر)
 * @route   API Routes
 * @access  Private (يتطلب توثيق المستخدم)
 */

const { addCart, deleteCart, updatecart, getCart } = require("../controllers/cartContoller");
const express = require("express");
const router = express.Router();
const isAuthenticated = require("../Middleware/verifyJWT");

/**
 * @route   GET /api/cart/
 * @desc    استعراض محتويات عربة التسوق الخاصة بالمستخدم
 * @access  Private (يتطلب التوثيق)
 */
router.get("/", isAuthenticated, getCart);

/**
 * @route   POST /api/cart/:id
 * @desc    إضافة عنصر إلى عربة التسوق
 * @access  Private (يتطلب التوثيق)
 */
router.post("/:id", isAuthenticated, addCart);

/**
 * @route   DELETE /api/cart/:id
 * @desc    حذف عنصر من عربة التسوق
 * @access  Private (يتطلب التوثيق)
 */
router.delete("/:id", isAuthenticated, deleteCart);

/**
 * @route   PUT /api/cart/:id
 * @desc    تحديث كمية عنصر في عربة التسوق
 * @access  Private (يتطلب التوثيق)
 */
router.put("/:id", isAuthenticated, updatecart);

// تصدير الراوتر
module.exports = router;
