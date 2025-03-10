/**
 * @desc    إدارة الفئات (إضافة، تحديث، حذف، واستعراض الفئات)
 * @route   API Routes
 * @access  Private (يتطلب توثيق المستخدم)
 */

const express = require('express');
const router = express.Router();
const { createCategory, getCategory, deleteCategory, updateCategory } = require('../controllers/categoryContoller');
const isAuthenticated = require("../Middleware/verifyJWT");

/**
 * @route   POST /api/category/
 * @desc    إنشاء فئة جديدة
 * @access  Private (يتطلب التوثيق)
 */
router.post('/', isAuthenticated, createCategory);

/**
 * @route   GET /api/category/
 * @desc    استعراض جميع الفئات
 * @access  Private (يتطلب التوثيق)
 */
router.get('/', isAuthenticated, getCategory);

/**
 * @route   PUT /api/category/:id
 * @desc    تحديث بيانات فئة معينة
 * @access  Private (يتطلب التوثيق)
 */
router.put('/:id', isAuthenticated, updateCategory);

/**
 * @route   DELETE /api/category/:id
 * @desc    حذف فئة معينة
 * @access  Private (يتطلب التوثيق)
 */
router.delete('/:id', isAuthenticated, deleteCategory);

// تصدير الراوتر
module.exports = router;
