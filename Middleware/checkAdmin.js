const User = require("../models/Users");

/**
 * @desc    التحقق مما إذا كان المستخدم لديه صلاحيات "admin"
 * @route   Middleware
 * @access  Private (Admin Only)
 * @throws  {Error} - في حالة عدم وجود المستخدم أو عدم امتلاكه صلاحيات المسؤول
 */

const User = require("../models/Users");

const checkAdmin = async (req, res, next) => {
  try {
    // التأكد من أن المستخدم موثق
    if (!req.user) {
      return res.status(401).json({ message: "لم يتم التوثيق" });
    }

    // جلب بيانات المستخدم من قاعدة البيانات
    const user = await User.findById(req.user);

    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    // التحقق مما إذا كان المستخدم يمتلك صلاحيات "admin"
    if (user.role !== "admin") {
      return res.status(403).json({ message: "لا تمتلك صلاحيات الوصول" });
    }

    // السماح بالانتقال إلى الوظيفة التالية إذا كان المستخدم مسؤولاً
    return next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "حدث خطأ في الخادم", error: error.message });
  }
};

// تصدير الميدل وير
module.exports = checkAdmin;
