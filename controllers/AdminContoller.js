const User = require("../models/Users");
const bcrypt = require("bcryptjs");

/**
 * @desc    إنشاء مستخدم جديد
 * @route   POST /api/admin
 * @access  Public
 */
const createUser = async (req, res) => {
    try {
        const { name, email, password, phone, confirmPassword, role } = req.body;

        // التحقق من المدخلات
        if (!name || !email || !password || !phone || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // تحقق من أن كلمة المرور وتأكيد كلمة المرور متساويان
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        // التحقق من وجود المستخدم
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        // إنشاء مستخدم جديد
        const user1 = new User({
            name,
            email,
            phone,
            password,  
            role,
            profileImg: req.file ? req.file.path : null // حفظ مسار الصورة إذا كانت موجودة
        });

        // حفظ المستخدم في قاعدة البيانات
        await user1.save();
        res.status(201).json({ message: "User created successfully", user1 });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    جلب جميع المستخدمين
 * @route   GET /api/admin
 * @access  Private (Admin)
 */
const getAllUsers = async (req, res) => {
    try {
        // جلب جميع المستخدمين من قاعدة البيانات
        const users = await User.find();  // يمكنك إضافة معايير أو تصفية إذا لزم الأمر

        // إذا كانت القائمة فارغة
        if (users.length === 0) {
            return res.status(404).json({ message: "No users found" });
        }

        // إرجاع قائمة المستخدمين
        return res.status(200).json(users);
    } catch (error) {
        // التعامل مع الأخطاء
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

/**
 * @desc    جلب بيانات المستخدم باستخدام الـ ID
 * @route   GET /api/admin/:id
 * @access  Private (Admin or User)
 */
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    تحديث بيانات المستخدم
 * @route   PUT /api/users/:id
 * @access  Private (Admin or User)
 */
const updateuser = async (req, res) => {
    try {
        const { name, email, phone, role } = req.body;
        const updatedData = { name, email, phone, role };
        const user = await User.findByIdAndUpdate(req.params.id, updatedData, { new: true });

        if (req.file) {
            updatedData.profileImg = req.file.path; // إذا تم رفع صورة جديدة
        }

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User updated successfully", user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    حذف مستخدم
 * @route   DELETE /api/admin/:id
 * @access  Private (Admin)
 */
const deletUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deletUser = await User.findByIdAndDelete(id);
        if (!deletUser) {
            return res.status(404).json({ message: "User not found" });
        };
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    تحديث كلمة مرور المستخدم
 * @route   PUT /api/admin/update-password/:id
 * @access  Private (User)
 */
const updatePassword = async (req, res) => {
    try {

        const { id } = req.body
        const { currentPassword, newPassword, confirmPassword } = req.body;

        // تحقق من أن المدخلات موجودة
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // تحقق من أن كلمة المرور الجديدة وتأكيد كلمة المرور متساويين
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "New password and confirm password do not match" });
        }

        // تحقق من أن كلمة المرور الجديدة لا تكون نفس كلمة المرور الحالية
        if (newPassword === currentPassword) {
            return res.status(400).json({ message: "New password cannot be the same as current password" });
        }

        // البحث عن المستخدم باستخدام الـ ID
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // تحقق من أن كلمة المرور الحالية صحيحة
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        user.password = newPassword;

        // حفظ المستخدم مع كلمة المرور الجديدة
        await user.save();

        res.status(200).json({ message: "Password updated successfully", data: user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createUser, getAllUsers, getUserById, updateuser, deletUser, updatePassword };
