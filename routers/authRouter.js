/**
 * @desc    إدارة مصادقة المستخدمين (تسجيل، تسجيل دخول، استعادة كلمة المرور، تحديث الحساب، تسجيل خروج)
 * @route   API Routes
 * @access  Public & Private (بحسب الحاجة)
 */

const express = require("express");
const router = express.Router();
const {
    register,
    login,
    forgetPassword,
    verifyPasswordResetCode,
    passwordResetCode,
    profile,
    updatePasswordUser,
    updateUserData,
    deactivateAccount,
    activateAccount,
    deleteAccount,
    refresh,
    logout
} = require("../controllers/authContoller");

const isAuthenticated = require("../Middleware/verifyJWT");

/**
 * @route   POST /api/auth/register
 * @desc    تسجيل مستخدم جديد
 * @access  Public
 */
router.post("/register", register);

/**
 * @route   POST /api/auth/login
 * @desc    تسجيل الدخول للمستخدم
 * @access  Public
 */
router.post("/login", login);

/**
 * @route   POST /api/auth/forgetpassword
 * @desc    طلب إعادة تعيين كلمة المرور
 * @access  Public
 */
router.post("/forgetpassword", forgetPassword);

/**
 * @route   POST /api/auth/verifyPasswordResetCode
 * @desc    التحقق من رمز إعادة تعيين كلمة المرور
 * @access  Public
 */
router.post("/verifyPasswordResetCode", verifyPasswordResetCode);

/**
 * @route   PUT /api/auth/passwordResetCode
 * @desc    إعادة تعيين كلمة المرور باستخدام الرمز
 * @access  Public
 */
router.put("/passwordResetCode", passwordResetCode);

/**
 * @route   GET /api/auth/profile
 * @desc    استعراض بيانات الملف الشخصي
 * @access  Private (يتطلب التوثيق)
 */
router.get("/profile", isAuthenticated, profile);

/**
 * @route   PUT /api/auth/updatePasswordUser
 * @desc    تحديث كلمة المرور للمستخدم
 * @access  Private (يتطلب التوثيق)
 */
router.put("/updatePasswordUser", isAuthenticated, updatePasswordUser);

/**
 * @route   PUT /api/auth/updateUserData
 * @desc    تحديث بيانات المستخدم
 * @access  Private (يتطلب التوثيق)
 */
router.put("/updateUserData", isAuthenticated, updateUserData);

/**
 * @route   PUT /api/auth/deactivate
 * @desc    إلغاء تنشيط الحساب
 * @access  Private (يتطلب التوثيق)
 */
router.put('/deactivate', isAuthenticated, deactivateAccount);

/**
 * @route   PUT /api/auth/activate
 * @desc    تفعيل الحساب
 * @access  Private (يتطلب التوثيق)
 */
router.put('/activate', isAuthenticated, activateAccount);

/**
 * @route   DELETE /api/auth/delete
 * @desc    حذف الحساب نهائياً
 * @access  Private (يتطلب التوثيق)
 */
router.delete('/delete', isAuthenticated, deleteAccount);

/**
 * @route   GET /api/auth/refreshtoken
 * @desc    تجديد التوكن للوصول المستمر
 * @access  Private (يتطلب التوثيق)
 */
router.get("/refreshtoken", isAuthenticated, refresh);

/**
 * @route   POST /api/auth/logout
 * @desc    تسجيل خروج المستخدم
 * @access  Private (يتطلب التوثيق)
 */
router.post("/logout", isAuthenticated, logout);

// تصدير الراوتر
module.exports = router;
