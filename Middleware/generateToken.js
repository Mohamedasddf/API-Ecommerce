const jwt = require("jsonwebtoken");
const User = require("../models/Users"); 

/**
 * @desc    إنشاء توكن الوصول (Access Token) للمستخدم
 * @param   {string} userId - معرف المستخدم
 * @returns {string} - توكن JWT صالح لمدة 90 دقيقة
 * @throws  {Error} - في حالة عدم وجود متغير البيئة ACCESS_TOKEN_SECRET
 */
const jwt = require("jsonwebtoken");
const User = require("../models/Users");

const generateAccessToken = (userId) => {
    if (!process.env.ACCESS_TOKEN_SECRET) {
        throw new Error("ACCESS_TOKEN_SECRET is missing from environment variables.");
    }

    return jwt.sign(
        { userInfo: { id: userId } }, // البيانات المدمجة (payload)
        process.env.ACCESS_TOKEN_SECRET, // السر المستخدم في التوقيع
        { expiresIn: "90m" } // مدة صلاحية التوكن
    );
};

/**
 * @desc    إنشاء توكن التحديث (Refresh Token) للمستخدم
 * @param   {string} userId - معرف المستخدم
 * @returns {string} - توكن JWT صالح لمدة 7 أيام
 * @throws  {Error} - في حالة عدم وجود متغير البيئة REFRESH_TOKEN_SECRET
 */
const generateRefreshToken = (userId) => {
    if (!process.env.REFRESH_TOKEN_SECRET) {
        throw new Error("REFRESH_TOKEN_SECRET is missing from environment variables.");
    }

    return jwt.sign(
        { userInfo: { id: userId } },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
    );
};

// تصدير الدوال لاستخدامها في المصادقة
module.exports = { generateAccessToken, generateRefreshToken };
