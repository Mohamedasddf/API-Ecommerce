const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { default: slugify } = require("slugify");

// إعداد الفاليداشن للبريد الإلكتروني ورقم الهاتف
const emailValidator = [/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/, 'Invalid email format'];
const phoneValidator = [/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format']; // التحقق من رقم الهاتف

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name Is Required"],
    },
    slug: {
        type: String,
        lowercase: true,
    },
    email: {
        type: String,
        required: [true, "Email Is Required"],
        unique: true,
        lowercase: true,
        match: emailValidator, // التحقق من البريد الإلكتروني باستخدام Regex
    },
    phone: {
        type: String,
        required: [true, "Phone Is Required"],
        match: phoneValidator, // التحقق من رقم الهاتف باستخدام Regex
    },
    profileImg: {
        type: String,
    },
    password: {
        type: String,
        required: [true, "Password Is Required"],
        minlength: [10, "Password is too short"],
    },
    passwordChangedAt: {
        type: Date,
    },
    passwordResetCode: {
        type: String
    },
    passwordResetExpires: {
        type: Date
    },
    passwordResetVerify: {
        type: Boolean
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    active: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

// قبل حفظ كلمة المرور، قم بتشفيرها
userSchema.pre("save", async function(next) {
    if (this.isModified("password")) { 
        this.password = await bcrypt.hash(this.password, 10);
        this.passwordChangedAt = Date.now(); // تحديث تاريخ تغيير كلمة المرور
    }
    next(); 
});

// إعداد الحقل slug بناءً على الاسم
userSchema.pre("save", async function (next) {
    if(this.name) {
        this.slug = slugify(this.name);
    }
    next();
})

const User = mongoose.model("User", userSchema);

module.exports = User;
