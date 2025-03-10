const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    discountType: { type: String, enum: ["percentage", "fixed"], required: true },
    discountValue: { type: Number, required: true },
    minOrderAmount: { type: Number, required: true },
    maxDiscount: { type: Number },
    expirationDate: { type: Date, required: true },
    usageLimit: { type: Number, default: 0 }, // الحد الأقصى للاستخدام
    usageCount: { type: Number, default: 0 }, // عدد مرات الاستخدام
    isActive: { type: Boolean, default: true }, // تعطيل الكوبون يدويًا
});

module.exports = mongoose.model("Coupon", couponSchema);
