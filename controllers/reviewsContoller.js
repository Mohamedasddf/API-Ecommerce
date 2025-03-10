const Review = require("../models/review");
const User = require("../models/Users");
const Product = require("../models/product");

/**
 * @desc    إنشاء مراجعة جديدة
 * @route   POST /api/reviews/:productId
 * @access  Private (Authenticated User)
 */
const createReview = async (req, res) => {
    try {
        const userId = req.user;
        const user = await User.findById(userId);
        
        if (!user) return res.status(400).json({ message: "User not found" });
        
        const { productId } = req.params;
        const { rating, comment } = req.body;

        if (!productId || !rating || !comment) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingReview = await Review.findOne({ user: userId, productId });
        if (existingReview) {
            return res.status(400).json({ message: "You have already reviewed this product. Please update your review instead." });
        }

        const review = new Review({ user: userId, productId, rating, comment });
        await review.save();

        res.status(201).json({ message: "Review created successfully", review });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

/**
 * @desc    جلب جميع التقييمات لمنتج معين
 * @route   GET /api/reviews/:productId
 * @access  Private (Authenticated User)
 */
const getReview = async (req, res) => {
    try {
        const { id } = req.params;
        const reviews = await Review.find({ id }).populate("user", "name");
        res.status(200).json({ reviews });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

/**
 * @desc    تحديث مراجعة موجودة
 * @route   PUT /api/reviews/:reviewId
 * @access  Private (Authenticated User)
 */
const updateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, comment } = req.body;

        if (rating == null || !comment) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const review = await Review.findById(reviewId);
        if (!review) return res.status(404).json({ message: "Review not found" });

        const user = await User.findById(req.user);
        const isAdmin = user ? (user.role === "admin") : false;

        if (review.user.toString() !== req.user.toString() && !isAdmin) {
            return res.status(403).json({ message: "You are not authorized to update this review" });
        }

        review.rating = rating;
        review.comment = comment;
        await review.save();

        res.status(200).json({ message: "Review updated successfully", review });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

/**
 * @desc    حذف مراجعة
 * @route   DELETE /api/reviews/:reviewId
 * @access  Private (Admin)
 */
const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const review = await Review.findById(reviewId);

        if (!review) return res.status(404).json({ message: "Review not found" });

        const user = await User.findById(req.user);
        const isAdmin = user ? (user.role === "admin") : false;

        if (review.user.toString() !== req.user.toString() && !isAdmin) {
            return res.status(403).json({ message: "You are not authorized to delete this review" });
        }

        await Review.findByIdAndDelete(reviewId);
        res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

module.exports = { createReview, getReview, updateReview, deleteReview };



