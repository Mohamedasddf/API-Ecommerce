/**
 * @desc    إدارة العلامات التجارية (إنشاء، تعديل، حذف، واستعراض العلامات التجارية)
 * @route   API Routes
 * @access  Public & Private (بحسب الحاجة)
 */

const express = require("express");
const router = express.Router();
const isAuthenticated = require("../Middleware/verifyJWT");
const checkAdmin = require("../Middleware/checkAdmin");
const { deleteBrand, updateBrand, getBrandById, getBrands, createBrand } = require("../controllers/brandContoller");

/**
 * @route   POST /api/brands/createbrand
 * @desc    إنشاء علامة تجارية جديدة
 * @access  Private (يتطلب توثيق المستخدم وصلاحيات الإدارة)
 */
router.post("/createbrand", isAuthenticated, checkAdmin, createBrand);

/**
 * @route   GET /api/brands/getbrands
 * @desc    استعراض جميع العلامات التجارية
 * @access  Private (يتطلب التوثيق)
 */
router.get("/getbrands", isAuthenticated, getBrands);

/**
 * @route   GET /api/brands/getbrand/:id
 * @desc    استعراض علامة تجارية معينة بواسطة معرفها
 * @access  Private (يتطلب التوثيق)
 */
router.get("/getbrand/:id", isAuthenticated, getBrandById);

/**
 * @route   PUT /api/brands/updatebrand/:id
 * @desc    تحديث بيانات علامة تجارية معينة
 * @access  Private (يتطلب توثيق المستخدم وصلاحيات الإدارة)
 */
router.put("/updatebrand/:id", isAuthenticated, checkAdmin, updateBrand);

/**
 * @route   DELETE /api/brands/deletebrand/:id
 * @desc    حذف علامة تجارية معينة
 * @access  Private (يتطلب توثيق المستخدم وصلاحيات الإدارة)
 */
router.delete("/deletebrand/:id", isAuthenticated, checkAdmin, deleteBrand);

// تصدير الراوتر
module.exports = router;
