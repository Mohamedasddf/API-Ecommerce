/**
 * @desc    إدارة عمليات الدفع (إنشاء، تنفيذ، إلغاء الدفع)
 * @route   API Routes
 * @access  Private (يتطلب التوثيق)
 */

const express = require('express');
const router = express.Router();
const { createPayment, executePayment, cancelPayment } = require("../controllers/paymentContoller");
const isAuthenticated = require("../Middleware/verifyJWT");

/**
 * @route   POST /api/payments/create-payment/:orderId
 * @desc    إنشاء عملية دفع جديدة لطلب معين
 * @access  Private (يتطلب التوثيق)
 */
router.post('/create-payment/:orderId', isAuthenticated, createPayment);

/**
 * @route   GET /api/payments/execute-payment
 * @desc    تنفيذ الدفع بعد الموافقة عليه من المستخدم
 * @access  Private (يتطلب التوثيق)
 */
router.get('/execute-payment', isAuthenticated, executePayment);

/**
 * @route   GET /api/payments/cancel
 * @desc    إلغاء عملية الدفع
 * @access  Private (يتطلب التوثيق)
 */
router.get('/cancel', isAuthenticated, cancelPayment);

// تصدير الراوتر
module.exports = router;
