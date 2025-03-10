const User = require("../models/Users");
const bcrypt = require("bcrypt");
const crypto =require("crypto");
const {sendMail} = require('../config/sendMaile');
const {generateAccessToken, generateRefreshToken, } = require('../Middleware/generateToken'); 
const moment = require('moment-timezone');
require('dotenv').config();
const jwt = require('jsonwebtoken');  // تأكد من استيراد مكتبة jsonwebtoken هنا

/**
 * @desc    تسجيل مستخدم جديد
 * @route   POST /api/register
 * @access  Public
 */

const register = async (req, res) => {
    try {
        const { name, email, phone, password, confirmPassword } = req.body;

        // التحقق من المدخلات
        if (!name || !email || !phone || !password || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // التحقق من تطابق كلمة المرور مع تأكيد كلمة المرور
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        // التحقق إذا كان هناك مستخدم موجود بنفس البريد الإلكتروني
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        // تشفير كلمة المرور باستخدام bcrypt قبل حفظها في قاعدة البيانات
        const hashedPassword = await bcrypt.hash(password, 10);

        // إنشاء المستخدم
        const newUser = await User.create({
            name,
            email,
            phone,
            password: hashedPassword, // حفظ كلمة المرور المشفرة
        });

        // توليد Access Token باستخدام _id للمستخدم الذي تم إنشاؤه
        const accessToken = generateAccessToken(newUser._id);

        // توليد Refresh Token باستخدام _id للمستخدم الذي تم إنشاؤه
        const refreshToken = generateRefreshToken(newUser._id);

        // إعداد الكوكيز للـ Refresh Token
        res.cookie("jwt", refreshToken, {
            httpOnly: true,  // لا يمكن الوصول إلى الكوكيز من خلال جافا سكريبت
            secure: process.env.NODE_ENV === "production",  // تأكد من أن الكوكيز مشفر في بيئة الإنتاج (يتطلب HTTPS)
            sameSite: "None",  // مناسب للموقع الذي قد يتطلب الوصول عبر نوافذ متعددة
            maxAge: 7 * 24 * 60 * 60 * 1000,  // مدة صلاحية الكوكيز 7 أيام
        });

        // إرسال الاستجابة مع بيانات المستخدم والـ Access Token
        res.status(200).json({
            name: newUser.name,
            email: newUser.email,
            accessToken,  // إرسال الـ Access Token للمستخدم
        });

    } catch (error) {
        // في حال حدوث خطأ أثناء عملية التسجيل
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


/**
 * @desc    تسجيل دخول المستخدم
 * @route   POST /api/login
 * @access  Public
 */
const login = async (req, res) => {
    try {
        // استخراج البريد الإلكتروني وكلمة المرور من الطلب
        const { email, password } = req.body;

        // التحقق من وجود البريد الإلكتروني وكلمة المرور
        if (!email || !password) {
            return res.status(401).json({ message: "Email and password are required" });
        }

        // البحث عن المستخدم باستخدام البريد الإلكتروني
        const user = await User.findOne({ email }).exec();
        console.log(user)
        // إذا لم يتم العثور على المستخدم، إرجاع خطأ
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // مقارنة كلمة المرور المدخلة بكلمة المرور المخزنة في قاعدة البيانات
        const isMatch = await bcrypt.compare(password, user.password);
        console.log(isMatch)
        // إذا لم تطابق كلمة المرور، إرجاع خطأ
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // توليد Access Token
        const accessToken = generateAccessToken(user._id);

        // توليد Refresh Token
        const refreshToken = generateRefreshToken(user._id);

        // إعداد الكوكيز للـ Refresh Token
        res.cookie("jwt", refreshToken, {
            httpOnly: true,  
            secure: process.env.NODE_ENV === "production",  // تأكد من أن الكوكيز مشفر في بيئة الإنتاج
            sameSite: "None",  
            maxAge: 7 * 24 * 60 * 60 * 1000,  
        });

        // إرسال الاستجابة مع بيانات المستخدم والـ Access Token
        res.status(200).json({
            name: user.name,
            email: user.email,
            accessToken,  // إرسال الـ Access Token للمستخدم
        });

    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

/**
 * @desc    تجديد رمز الوصول باستخدام refresh token
 * @route   POST /api/refresh
 * @access  Private (Requires valid refresh token)
 */
const refresh = async (req, res) => {
    try {
        // تأكد من استخدام 'req.cookies' بدلًا من 'req.Cookies'
        const cookies = req.cookies;
        console.log(cookies); // هذا سيساعدك في التحقق من محتويات الكوكيز.

        // إذا لم يكن هناك توكن في الكوكيز، أرجع استجابة Unauthorized
        if (!cookies?.jwt) return res.status(401).json({ message: "Unauthorized - No JWT found" });

        const refreshToken = cookies.jwt;
        // التحقق من صحة التوكن باستخدام السر المخصص للتوكن
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        // البحث عن المستخدم في قاعدة البيانات باستخدام الـ ID المستخرج من التوكن
        const foundUser = await User.findById(decoded.userInfo.id).exec();
        if (!foundUser) return res.status(401).json({ message: "Unauthorized - User not found" });

        // توليد الـ access token الجديد
        const accessToken = jwt.sign(
            { userInfo: { id: foundUser._id } },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "15m" }
        );

        // إرجاع الـ access token الجديد في الاستجابة
        res.json({ accessToken });
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(403).json({ message: "Invalid Token" });
        } else if (error.name === "TokenExpiredError") {
            return res.status(403).json({ message: "Token Expired" });
        }
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};   

/**
 * @desc    تسجيل الخروج
 * @route   POST /api/logout
 * @access  Private (Admin or User)
 */
const logout = (req, res) => {
    const cookies = req.cookies;
    
    if (!cookies?.jwt) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    // مسح الكوكيز
    res.clearCookie("jwt", {
        httpOnly: true,
        secure: true,
        sameSite: "None",
    });

    // إرسال رسالة تأكيد بعد الخروج
    res.status(200).json({ message: "Successfully logged out" });
};

/**
 * @desc    إرسال رمز إعادة تعيين كلمة المرور
 * @route   POST /api/forgetPassword
 * @access  Public
 */
const forgetPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ message: `User not found with email: ${req.body.email}` });
    }

    // توليد رمز إعادة تعيين كلمة المرور
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashCode = crypto.createHash('sha256').update(resetCode).digest('hex');

    // تحديث بيانات المستخدم
    user.passwordResetCode = hashCode;
    user.passwordResetExpires = Date.now() + 5 * 60 * 1000; // 2 ساعة + 5 دقائق
    user.passwordResetVerify = false;

    await user.save();


    // تنسيق وقت انتهاء الصلاحية
    const expirationTime = new Date(user.passwordResetExpires).toLocaleString(); 

    // إرسال البريد الإلكتروني مع رمز التحقق
    await sendMail({
      email: user.email,
      subject: 'Your Verification Code',
      html: `<p>Hello, ${user.name}</p>
             <p>Your verification code is: <strong>${resetCode}</strong></p>
             <p>This code will expire in 5 minutes at ${expirationTime}.</p>
             <p>Thank you for using our service.</p>`
    });

    res.status(200).json({ message: 'Reset code generated and saved successfully. Please check your email.' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'An error occurred while processing the request.', error: err.message });
  }
};

/**
 * @desc    التحقق من رمز إعادة تعيين كلمة المرور
 * @route   POST /api/verifyPasswordResetCode
 * @access  Public
 */
const verifyPasswordResetCode = async (req, res) => {
    const { resetCode } = req.body;
    const hashResetCode = crypto.createHash('sha256').update(resetCode).digest('hex');

    const currentTime = Date.now(); // الوقت الحالي بالمللي ثانية
    const user = await User.findOne({
        passwordResetCode: hashResetCode,
        passwordResetExpires: { $gt: currentTime } // تأكد من أن الكود لم ينتهِ بعد
    });

    if (!user) {
        return res.status(400).json({ message: "Reset code is invalid or expired" });
    }
    

    user.passwordResetVerify = true;
    await user.save();

    res.status(200).json({ message: "Success" });
};

/**
 * @desc    إعادة تعيين كلمة المرور بعد التحقق من الرمز
 * @route   POST /api/passwordResetCode
 * @access  Public
 */
const passwordResetCode = async (req, res) => {
    try{
        const { email, newpassword } = req.body;
    if(!email || !newpassword){
        return res.status(400).json({ message: "Both email and new password are required"})
    }

    const user = await User.findOne({ email });
    if(!user){
        return res.status(404).json({ message: "User not found" })
    };

    if(user.passwordResetVerify === false){
        return res.status(400).json({ message: "Reset code not verified" })
    }

    user.password = newpassword;
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerify = undefined;
    await user.save();

    const accessToken = generateAccessToken(user._id)

    res.status(200).json({
        message: "Your password has been successfully reset and updated.",
        accessToken
    });
    }catch(err) {
        return res.status(500).json({ error: err.message})
    }
}

/**
 * @desc    عرض بيانات المستخدم المسجل
 * @route   GET /api/profile
 * @access  Private (User)
 */
const profile = async (req, res) => {
    try {
        const user = await User.findById(req.user);     
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // إرجاع بيانات المستخدم
        res.status(200).json({
            message: "User profile fetched successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        });
    } catch (error) {
        // في حال حدوث أي خطأ أثناء استرجاع البيانات
        res.status(500).json({ message: "Error fetching user profile", error: error.message });
    }
};

/**
 * @desc    تحديث كلمة مرور المستخدم
 * @route   PUT /api/updatePasswordUser
 * @access  Private (User)
 */
const updatePasswordUser = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        // التحقق من وجود جميع الحقول
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // التحقق من تطابق كلمة المرور الجديدة مع تأكيد كلمة المرور
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "New password and confirm password do not match" });
        }

        // التحقق من أن كلمة المرور الجديدة ليست هي نفسها كلمة المرور الحالية
        if (newPassword === currentPassword) {
            return res.status(400).json({ message: "New password cannot be the same as current password" });
        }

        // العثور على المستخدم بناءً على المعلومات المخزنة في req.user
        const user = await User.findById(req.user); 
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // التحقق من تطابق كلمة المرور الحالية مع كلمة المرور المخزنة في قاعدة البيانات
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }


        // تحديث كلمة المرور في قاعدة البيانات
        user.password = newPassword;
        const accessToken = generateAccessToken(user._id)

        await user.save(); // حفظ التغييرات في قاعدة البيانات

        res.status(200).json({ message: "Password updated successfully", accessToken });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    تحديث بينات المستخدم
 * @route   PUT /api/updateUserData
 * @access  Private (User)
 */
const updateUserData = async (req, res) => {
    try {
        const { name, email, phone, password, confirmPassword, profileImg } = req.body;

        if (!name || !email || !phone || !profileImg) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findById(req.user);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (password || confirmPassword) {
            delete req.body.password;
            delete req.body.confirmPassword;
        }

        user.name = name;
        user.email = email;
        user.phone = phone;
        user.profileImg = profileImg;

        await user.save();

        res.status(200).json({
            message: "User data updated successfully"
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

/**
 * @desc    توقيف حساب المستخدم  
 * @route   PUT /api/deactivateAccount
 * @access  Private (User)
 */
const deactivateAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // تغيير حالة المستخدم إلى غير مفعل
        user.active = false;
        await user.save();

        res.status(200).json({
            message: "Account deactivated successfully"
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

/**
 * @desc    تشغيل حساب المستخدم
 * @route   PUT /api/activateAccount
 * @access  Private (User)
 */
const activateAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // تغيير حالة المستخدم إلى مفعل
        user.active = true;
        await user.save();

        res.status(200).json({
            message: "Account activated successfully"
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

/**
 * @desc    حذف حساب المستخدم
 * @route   Delete /api/deleteAccount
 * @access  Private (User)
 */
const deleteAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user); 

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // حذف المستخدم بالكامل من قاعدة البيانات
        await User.findByIdAndDelete(req.user);

        res.status(200).json({
            message: "User account deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};



module.exports = {
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
    logout };
