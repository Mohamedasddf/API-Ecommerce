/**
 * تحميل المتغيرات البيئية من ملف .env
 */
require('dotenv').config();

const express = require("express");
const cookieParser = require("cookie-parser");
const jwt = require('jsonwebtoken');  
const mongoose = require("mongoose");
const multer = require("multer");
const connectDB = require('./config/db');
const path = require('path'); 
const fs = require('fs'); 

// استيراد جميع الروترات
const adminRouter = require("./routers/adminRouter");
const categoryRouter = require("./routers/categoryRouter");
const subCategoryRouter = require("./routers/supCategoryRouter");
const brandRouter = require("./routers/brandRouter");
const authRouter = require("./routers/authRouter");
const productRouter = require("./routers/productRouter");
const cartRouter = require("./routers/cartRouter");
const orderRouter = require("./routers/orderRouter");
const reviewRouter = require("./routers/reviewRouter");
const addressRouter = require("./routers/addressRoutes");
const couponRouter = require("./routers/couponRouter");
const paymentRouter = require("./routers/paymentRouter");
const chatRouter = require("./routers/chatRouter");

const app = express();

/**
 * إعدادات الإكسبريس
 */
app.use(express.static(path.join(__dirname, "views"))); // جعل مجلد "views" ثابتًا يمكن الوصول إليه
app.use(cookieParser()); // تفعيل معالجة الكوكيز
app.use(express.json()); // معالجة بيانات JSON القادمة من الطلبات
app.use(express.urlencoded({ extended: true })); // معالجة بيانات URL-encoded

/**
 * التأكد من وجود مجلد 'uploads/' لتخزين الملفات المرفوعة
 */
const uploadPath = './uploads';
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath);
}

/**
 * إعداد تخزين الملفات باستخدام Multer
 */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // تخزين الملفات في مجلد uploads/
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // اسم فريد للملف
    }
});

const upload = multer({ storage: storage });

/**
 * الاتصال بقاعدة البيانات MongoDB
 */
connectDB();

/**
 * إعداد المسارات (Routes)
 */
app.use('/api/categories', categoryRouter);
app.use('/api/subcategorys', subCategoryRouter);
app.use('/api/brand', brandRouter);
app.use('/api/products', productRouter);
app.use('/api/admin', adminRouter);
app.use('/api/auth', authRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);
app.use('/api/review', reviewRouter);
app.use('/api/address', addressRouter);
app.use('/api/coupon', couponRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/chat', chatRouter);

/**
 * التعامل مع المسارات غير الموجودة (404)
 */
app.all("*", (req, res) => {
    res.status(404).json({ message: `Can't Find This Route: ${req.originalUrl}` });
});

/**
 * التعامل مع الأخطاء في السيرفر
 * @param {Error} err - الخطأ
 * @param {Request} req - الطلب
 * @param {Response} res - الاستجابة
 * @param {Function} next - التابع التالي
 */
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Something went wrong!';
    res.status(statusCode).json({ message });
});

/**
 * بدء تشغيل السيرفر بعد الاتصال بقاعدة البيانات
 */
mongoose.connection.once("open", () => {
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
});