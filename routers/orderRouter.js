/**
 * @desc    إدارة الطلبات (إنشاء، استعراض، تحديث، حذف الطلبات)
 * @route   API Routes
 * @access  Private (يتطلب التوثيق، بعض العمليات تتطلب صلاحيات المسؤول)
 */

const express = require('express');
const router = express.Router();
const { 
    createOrder, 
    getAllOrder, 
    getOrderById, 
    updateOrderStatus, 
    deleteOrder, 
    getOrderCompleted 
} = require('../controllers/orderCotoller');

const isAuthenticated = require("../Middleware/verifyJWT");
const checkAdmin = require("../Middleware/checkAdmin");

/**
 * @route   POST /api/orders/createorder
 * @desc    إنشاء طلب جديد
 * @access  Private (يتطلب التوثيق)
 */
router.post("/createorder", isAuthenticated, createOrder);

/**
 * @route   GET /api/orders/getorders
 * @desc    استعراض جميع الطلبات (للمستخدم العادي)
 * @access  Private (يتطلب التوثيق)
 */
router.get("/getorders", isAuthenticated, getAllOrder);

/**
 * @route   GET /api/orders/getordersadmin
 * @desc    استعراض جميع الطلبات (للمسؤول فقط)
 * @access  Private (يتطلب التوثيق وصلاحيات المسؤول)
 */
router.get("/getordersadmin", isAuthenticated, checkAdmin, getAllOrder);

/**
 * @route   GET /api/orders/getorder/:id
 * @desc    استعراض تفاصيل طلب معين (للمستخدم العادي)
 * @access  Private (يتطلب التوثيق)
 */
router.get("/getorder/:id", isAuthenticated, getOrderById);

/**
 * @route   GET /api/orders/getorderadmin/:id
 * @desc    استعراض تفاصيل طلب معين (للمسؤول فقط)
 * @access  Private (يتطلب التوثيق وصلاحيات المسؤول)
 */
router.get("/getorderadmin/:id", isAuthenticated, checkAdmin, getOrderById);

/**
 * @route   PUT /api/orders/updateorderstatus/:id
 * @desc    تحديث حالة الطلب (للمسؤول فقط)
 * @access  Private (يتطلب التوثيق وصلاحيات المسؤول)
 */
router.put("/updateorderstatus/:id", isAuthenticated, checkAdmin, updateOrderStatus);

/**
 * @route   DELETE /api/orders/deleteorderadmin/:id
 * @desc    حذف طلب معين (للمسؤول فقط)
 * @access  Private (يتطلب التوثيق وصلاحيات المسؤول)
 */
router.delete("/deleteorderadmin/:id", isAuthenticated, checkAdmin, deleteOrder);

/**
 * @route   GET /api/orders/getordercompleted
 * @desc    استعراض الطلبات المكتملة
 * @access  Private (يتطلب التوثيق)
 */
router.get("/getordercompleted", isAuthenticated, getOrderCompleted);

// تصدير الراوتر
module.exports = router;
