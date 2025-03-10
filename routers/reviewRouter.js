/**
 * @desc    إدارة التقييمات (إنشاء، عرض، تعديل، حذف)
 * @route   API Routes
 * @access  بعض العمليات تتطلب التوثيق
 */

const express = require("express");
const router = express.Router();
const { createReview, getReview, updateReview, deleteReview } = require("../controllers/reviewsContoller");
const isAuthenticated = require("../Middleware/verifyJWT");

/**
 * @route   POST /api/reviews/createreview/:id
 * @desc    إنشاء تقييم جديد لمنتج معين
 * @access  Private (يتطلب التوثيق)
 */
router.post("/createreview/:id", isAuthenticated, createReview);

/**
 * @route   GET /api/reviews/getreview
 * @desc    جلب جميع التقييمات
 * @access  Private (يتطلب التوثيق)
 */
router.get("/getreview", isAuthenticated, getReview);

/**
 * @route   PUT /api/reviews/updatereview/:id
 * @desc    تعديل تقييم معين
 * @access  Private (يتطلب التوثيق)
 */
router.put("/updatereview/:id", isAuthenticated, updateReview);

/**
 * @route   DELETE /api/reviews/deleteReview/:id
 * @desc    حذف تقييم معين
 * @access  Private (يتطلب التوثيق)
 */
router.delete("/deleteReview/:id", isAuthenticated, deleteReview);

// تصدير الراوتر
module.exports = router;
