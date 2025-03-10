const jwt = require("jsonwebtoken");

/**
 * @desc    التحقق من مصادقة المستخدم باستخدام JWT
 * @middleware  isAuthenticated
 * @access  Private (User/Admin)
 */
const jwt = require("jsonwebtoken");

const isAuthenticated = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || req.headers.Authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized: No token provided or invalid format" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        req.user = decoded.userInfo.id;

        next();
    } catch (error) {
        // تسجيل الخطأ لسهولة التتبع
        console.error(error);

        // التعامل مع انتهاء صلاحية الرمز المميز
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired. Please log in again." });
        }

        // التعامل مع الأخطاء الأخرى المتعلقة بـ JWT
        if (error.name === "JsonWebTokenError") {
            return res.status(403).json({ message: "Invalid token" });
        }

        // الاستجابة الافتراضية في حال حدوث خطأ آخر
        return res.status(403).json({ message: "Forbidden: Invalid token" });
    }
};

module.exports = isAuthenticated;
