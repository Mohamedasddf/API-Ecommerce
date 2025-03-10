/**
 * @desc    إدارة المستخدمين (إضافة، عرض، تعديل، وحذف) بواسطة المسؤول (Admin)
 * @route   API Routes
 * @access  Private (Admin Authentication Required)
 */

const express = require("express");
const router = express.Router();
const {
    createUser,
    getAllUsers,
    getUserById,
    updateuser,
    deletUser,
    updatePassword
} = require("../controllers/AdminContoller");

const isAuthenticated = require("../Middleware/verifyJWT");
const checkAdmin = require("../Middleware/checkAdmin");

/**
 * @route   POST /api/admin/register
 * @desc    إنشاء مستخدم جديد بواسطة الأدمن
 * @access  Private (Admin فقط)
 */
router.post("/register", isAuthenticated, checkAdmin, createUser);

/**
 * @route   GET /api/admin/:id
 * @desc    الحصول على بيانات مستخدم معين بواسطة الـ ID
 * @access  Private (Admin فقط)
 */
router.get("/:id", isAuthenticated, checkAdmin, getUserById);

/**
 * @route   GET /api/admin/getuser
 * @desc    جلب جميع المستخدمين
 * @access  Private (Admin فقط)
 */
router.get("/getuser", isAuthenticated, checkAdmin, getAllUsers);

/**
 * @route   PUT /api/admin/:id
 * @desc    تحديث بيانات مستخدم معين
 * @access  Private (Admin فقط)
 */
router.put("/:id", isAuthenticated, checkAdmin, updateuser);

/**
 * @route   DELETE /api/admin/:id
 * @desc    حذف مستخدم معين بواسطة الـ ID
 * @access  Private (Admin فقط)
 */
router.delete("/:id", isAuthenticated, checkAdmin, deletUser);

/**
 * @route   PUT /api/admin/update-password/:id
 * @desc    تحديث كلمة مرور مستخدم معين
 * @access  Private (Admin فقط)
 */
router.put("/update-password/:id", isAuthenticated, checkAdmin, updatePassword);

// تصدير الراوتر
module.exports = router;
