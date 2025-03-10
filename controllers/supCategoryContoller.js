const User  = require("../models/Users");
const Category = require("../models/category");
const SubCategory = require("../models/supCategory");
const { default: slugify } = require("slugify");

/**
 * @desc    إنشاء فئة فرعية جديدة
 * @route   POST /api/subcategories
 * @access  Private (Admin)
 */
const createSubCategory = async (req, res) => {
    try {
        const { userId } = req.user;
        const user = await User.findById(userId)
        if(!user) {
            returnres.status(404).json({ message: "User not found"})
        }
        const isAdmin = user ? (user.role === "admin") : false;
        if (!isAdmin) {
            return res.status(403).json({ message: "You are not authorized to update this supcategory" });
        }
        const { name, categoryId, brandId } = req.body;
        if (!name || !categoryId) {
            return res.status(400).json({ message: "الاسم ومعرف الفئة مطلوبان" });
        }
        
        const category = await Category.findById(categoryId);
        if (!category) return res.status(400).json({ message: "الفئة غير صالحة" });

        const subCategory = new SubCategory({ 
            name, 
            slug: slugify(name), 
            category: categoryId, 
            brand: brandId 
        });
        await subCategory.save();
        res.status(201).json({ message: "تم إنشاء الفئة الفرعية بنجاح", subCategory });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    جلب جميع الفئات الفرعية
 * @route   GET /api/subcategories
 * @access  Private (Authenticated User)
 */
const getSubCategories = async (req, res) => {
    try {
        const subCategories = await SubCategory.find().populate("category");
        res.json(subCategories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    تحديث فئة فرعية
 * @route   PUT /api/subcategories/:id
 * @access  Private (Admin)
 */
const updateSubCategory = async (req, res) => {
    try {
        const { userId } = req.user;
        const user = await User.findById(userId)
        if(!user) {
            returnres.status(404).json({ message: "User not found"})
        }
        const isAdmin = user ? (user.role === "admin") : false;
        if (!isAdmin) {
            return res.status(403).json({ message: "You are not authorized to update this supcategory" });
        }

        const updates = { ...req.body };

        const subCategory = await SubCategory.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!subCategory) return res.status(404).json({ message: "لم يتم العثور على الفئة الفرعية" });
        res.json(subCategory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    حذف فئة فرعية
 * @route   DELETE /api/subcategories/:id
 * @access  Private (Admin)
 */
const deleteSubCategory = async (req, res) => {
    try {
        const { userId } = req.user;
        const user = await User.findById(userId)
        if(!user) {
            returnres.status(404).json({ message: "User not found"})
        }
        const isAdmin = user ? (user.role === "admin") : false;
        if (!isAdmin) {
            return res.status(403).json({ message: "You are not authorized to update this supcategory" });
        }
        const subCategory = await SubCategory.findByIdAndDelete(req.params.id);
        if (!subCategory) return res.status(404).json({ message: "لم يتم العثور على الفئة الفرعية" });
        res.json({ message: "تم حذف الفئة الفرعية بنجاح" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    جلب فئة فرعية بواسطة ID
 * @route   GET /api/subcategories/:id
 * @access  Private (Authenticated User)
 */
const getSubCategoryById = async (req, res) => {
    try {
        const subCategory = await SubCategory.findById(req.params.id).populate("category");
        if (!subCategory) {
            return res.status(404).json({ message: "لم يتم العثور على الفئة الفرعية" });
        }
        res.json(subCategory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    createSubCategory, 
    getSubCategories, 
    updateSubCategory,
    deleteSubCategory,
    getSubCategoryById, 
};