/**
 * @desc    إدارة الكوبونات (إضافة، تحديث، حذف، وتطبيق الكوبونات)
 * @route   API Routes
 * @access  Private (يتطلب التوثيق، بعض العمليات تتطلب صلاحيات المسؤول)
 */

const express = require("express");
const router = express.Router();
const { 
    createCoupon, 
    getCoupons, 
    updateCoupon, 
    deleteCoupon, 
    applyCoupon 
} = require("../controllers/couponContoller");

const isAuthenticated = require("../Middleware/verifyJWT");
const checkAdmin = require("../Middleware/checkAdmin");

/**
 * @route   POST /api/coupons/createcoupon
 * @desc    إنشاء كوبون جديد
 * @access  Private (يتطلب التوثيق وصلاحيات المسؤول)
 */
router.post("/createcoupon", isAuthenticated, checkAdmin, createCoupon);

/**
 * @route   GET /api/coupons/getcoupons
 * @desc    استعراض جميع الكوبونات
 * @access  Private (يتطلب التوثيق وصلاحيات المسؤول)
 */
router.get("/getcoupons", isAuthenticated, checkAdmin, getCoupons);

/**
 * @route   PUT /api/coupons/updatecoupon/:id
 * @desc    تحديث بيانات كوبون معين
 * @access  Private (يتطلب التوثيق وصلاحيات المسؤول)
 */
router.put("/updatecoupon/:id", isAuthenticated, checkAdmin, updateCoupon);

/**
 * @route   DELETE /api/coupons/deletecoupon/:id
 * @desc    حذف كوبون معين
 * @access  Private (يتطلب التوثيق وصلاحيات المسؤول)
 */
router.delete("/deletecoupon/:id", isAuthenticated, checkAdmin, deleteCoupon);

/**
 * @route   POST /api/coupons/applycoupon/:id
 * @desc    تطبيق كوبون على عملية شراء
 * @access  Private (يتطلب التوثيق)
 */
router.post("/applycoupon/:id", isAuthenticated, applyCoupon);

// تصدير الراوتر
module.exports = router;
