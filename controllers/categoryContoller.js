const Category = require("../models/category");
const { default: slugify } = require("slugify");

/**
 * @desc    إنشاء فئة جديدة
 * @route   POST /api/categories
 * @access  Private (Admin)
 */
const createCategory = async (req, res) => {
    try {
        const user = await User.findById(req.user);
        const isAdmin = user ? (user.role === "admin") : false;

        if (!isAdmin) {
            return res.status(403).json({ message: "You are not authorized to delete this review" });
        }

        const { name } = req.body;
        const category = new Category({ name });

        await category.save();
        res.status(201).json({ message: "Category created successfully", category });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * @desc    جلب جميع الفئات
 * @route   GET /api/categories
 * @access  Public
 */
const getCategory = async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * @desc    جلب فئة حسب ID
 * @route   GET /api/categories/:id
 * @access  Public
 */
const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json(category);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * @desc    تحديث فئة
 * @route   PUT /api/categories/:id
 * @access  Private (Admin)
 */
const updateCategory = async (req, res) => {
    try {
        const user = await User.findById(req.user);
        const isAdmin = user ? (user.role === "admin") : false;

        if (!isAdmin) {
            return res.status(403).json({ message: "You are not admin to update this category" });
        }

        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (!category) return res.status(404).json({ message: "Category not found" });
        res.json(category);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * @desc    حذف فئة
 * @route   DELETE /api/categories/:id
 * @access  Private (Admin)
 */
const deleteCategory = async (req, res) => {
    try {
        const user = await User.findById(req.user);
        const isAdmin = user ? (user.role === "admin") : false;

        if (!isAdmin) {
            return res.status(403).json({ message: "You are not admin to delete this category" });
        }

        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) return res.status(404).json({ message: "Category not found" });

        res.json({ message: "Category deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { createCategory, getCategory, getCategoryById, updateCategory, deleteCategory };
