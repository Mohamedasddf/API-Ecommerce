/**
 * @desc    إدارة عناوين المستخدمين (إضافة، عرض، وتحديث)
 * @route   API Routes
 * @access  Private (User Authentication Required)
 */

const express = require("express");
const router = express.Router();
const { createAddress, getAddress, updateAddress } = require("../controllers/addressContoller");
const isAuthenticated = require("../Middleware/verifyJWT");

/**
 * @route   POST /api/address/createaddress
 * @desc    إنشاء عنوان جديد للمستخدم
 * @access  Private (يتطلب التوثيق)
 */
router.post("/createaddress", isAuthenticated, createAddress);

/**
 * @route   GET /api/address/getaddress
 * @desc    الحصول على عنوان المستخدم المسجل
 * @access  Private (يتطلب التوثيق)
 */
router.get("/getaddress", isAuthenticated, getAddress);

/**
 * @route   PUT /api/address/updateaddress/:id
 * @desc    تحديث عنوان المستخدم بناءً على الـ ID
 * @access  Private (يتطلب التوثيق)
 */
router.put("/updateaddress/:id", isAuthenticated, updateAddress);

// تصدير الراوتر
module.exports = router;
