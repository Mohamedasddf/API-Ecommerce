const Coupon = require("../models/coupon");
const Order = require("../models/order");

/**
 * @desc    إنشاء كوبون جديد
 * @route   POST /api/coupons
 * @access  Private (Admin)
 */
const createCoupon = async (req, res) => {
    try {
        const user = await User.findById(req.user);
        const isAdmin = user ? (user.role === "admin") : false;

        if (!isAdmin) {
            return res.status(403).json({ message: "You are not admin to create coupon " });
        }
        const { code, discountType, discountValue, minOrderAmount, maxDiscount, expirationDate } = req.body;

        if (!code || !discountType || !discountValue || !expirationDate) {
            return res.status(400).json({ message: "All required fields must be provided" });
        }

        const existingCoupon = await Coupon.findOne({ code });
        if (existingCoupon) { 
            return res.status(400).json({ message: "Coupon code already exists" });
        }

        const coupon = new Coupon({ 
            code,
            discountType,
            discountValue,
            minOrderAmount,
            maxDiscount,
            expirationDate
        });

        await coupon.save();
        res.status(201).json({ message: "Coupon created successfully", coupon });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

/**
 * @desc    جلب جميع الكوبونات
 * @route   GET /api/coupons
 * @access  Private (Admin)
 */
const getCoupons = async (req, res) => {
    try {
        const user = await User.findById(req.user);
        const isAdmin = user ? (user.role === "admin") : false;

        if (!isAdmin) {
            return res.status(403).json({ message: "You are not admin to get coupons" });
        }
        const coupons = await Coupon.find();
        res.json({ coupons });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching coupons", error: error.message });
    }
};

/**
 * @desc    تحديث كوبون
 * @route   PUT /api/coupons/:couponId
 * @access  Private (Admin)
 */
const updateCoupon = async (req, res) => {
    try {
        const user = await User.findById(req.user);
        const isAdmin = user ? (user.role === "admin") : false;

        if (!isAdmin) {
            return res.status(403).json({ message: "You are not admin to update this coupon" });
        }

        const { discountType, discountValue, minOrderAmount, maxDiscount, expirationDate } = req.body;
        const coupon = await Coupon.findById(req.params.id);
      
        if (!coupon) return res.status(404).json({ message: "Coupon not found" });

        coupon.discountType = discountType || coupon.discountType;
        coupon.discountValue = discountValue || coupon.discountValue;
        coupon.minOrderAmount = minOrderAmount || coupon.minOrderAmount;
        coupon.maxDiscount = maxDiscount || coupon.maxDiscount;
        coupon.expirationDate = expirationDate || coupon.expirationDate;
      
        await coupon.save();
        res.json({ message: "Coupon updated successfully", coupon });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating coupon", error: error.message });
    }
};

/**
 * @desc    حذف كوبون
 * @route   DELETE /api/coupons/:couponId
 * @access  Private (Admin)
 */
const deleteCoupon = async (req, res) => {
    try {
        const user = await User.findById(req.user);
        const isAdmin = user ? (user.role === "admin") : false;

        if (!isAdmin) {
            return res.status(403).json({ message: "You are not authorized to delete this review" });
        }

        const { id } = req.params;
        const coupon = await Coupon.findByIdAndDelete(id);

        if (!coupon) return res.status(404).json({ message: "Coupon not found" });
        res.json({ message: "Coupon deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting coupon", error: error.message });
    }
};

/**
 * @desc    تطبيق كوبون على الطلب
 * @route   POST /api/orders/:orderId/apply-coupon
 * @access  Private (Authenticated User)
 */
const applyCoupon = async (req, res) => {
    try {
        const user = await User.findById(req.user);
        const isAdmin = user ? (user.role === "admin") : false;

        if (!user && !isAdmin) {
            return res.status(403).json({ message: "You are not authorized to apply this coupons" });
        }

        const { code } = req.body;
        const { orderId } = req.params;

        const order = await Order.findOne({ _id: orderId, user: user._id });
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        const coupon = await Coupon.findOne({ code });
        if (!coupon) {
            return res.status(404).json({ message: "Invalid coupon code" });
        }

        // التحقق مما إذا كان الكوبون غير مفعل
        if (!coupon.isActive) {
            return res.status(400).json({ message: "This coupon is not active" });
        }

        // التحقق مما إذا كان الكوبون قد تجاوز الحد الأقصى للاستخدام
        if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) {
            return res.status(400).json({ message: "Coupon usage limit reached" });
        }

        // التحقق من انتهاء صلاحية الكوبون
        if (new Date(coupon.expirationDate) < new Date()) {
            return res.status(400).json({ message: "Coupon has expired" });
        }

        // التحقق من الحد الأدنى للطلب
        if (order.totalAmount < coupon.minOrderAmount) {
            return res.status(400).json({ message: `Minimum order amount required: ${coupon.minOrderAmount}` });
        }

        // التحقق مما إذا كان المستخدم قد استخدم الكوبون من قبل لهذا الطلب
        if (order.appliedCoupon) {
            return res.status(400).json({ message: "A coupon has already been applied to this order" });
        }

        // حساب قيمة الخصم
        let discount = 0;
        if (coupon.discountType === "percentage") {
            discount = (order.totalAmount * coupon.discountValue) / 100;
            if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                discount = coupon.maxDiscount;
            }
        } else {
            discount = coupon.discountValue;
        }

        // تحديث المبلغ بعد الخصم
        order.totalAmount -= discount;
        order.appliedCoupon = coupon._id; // حفظ الكوبون المستخدم
        await order.save();

        // تحديث عدد مرات استخدام الكوبون
        coupon.usageCount += 1;
        await coupon.save();

        res.json({
            message: "Coupon applied successfully",
            discount,
            finalAmount: order.totalAmount
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    createCoupon,
    getCoupons,
    updateCoupon,
    deleteCoupon,
    applyCoupon
};
