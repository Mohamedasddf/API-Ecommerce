const Product = require('../models/product');
const Category = require('../models/category');
const SubCategory = require('../models/supCategory');
const Brand = require('../models/brand');
const User = require("../models/Users")
/**
 * @desc    إنشاء منتج جديد
 * @route   POST /api/products
 * @access  Private (Admin)
 */
const createProduct = async (req, res) => {
    try {
        const { name, price, description, categoryId, stock, subCategoryId, colors, size, quantity, image, brandId } = req.body;

        const category = await Category.findById(categoryId);
        const subCategory = await SubCategory.findById(subCategoryId);
        const brand = await Brand.findById(brandId)

        if (!category || !subCategory || !brand) {
            return res.status(400).json({ message: 'Invalid category or subcategory' });
        }

        const user = await User.findById(req.user);
        const isAdmin = user ? (user.role === "admin") : false;
        if(!isAdmin){
            return res.status(403).json({ message: "You are not admin to create product" });
        }
        const newProduct = new Product({
            name,
            price,
            description,
            category: categoryId,
            subCategory: subCategoryId,
            stock,
            colors,
            size,
            quantity,
            image,
            brand: brandId
        });

        await newProduct.save();
        res.status(201).json({ message: 'Product created successfully', product: newProduct });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * @desc    جلب جميع المنتجات مع ميزات البحث، الفرز، التقسيم واختيار الحقول
 * @route   GET /api/products
 * @access  Private (Authenticated User)
 */
const getAllProducts = async (req, res) => {
    try {
        const { 
            sortBy = 'name', 
            order = 'asc', 
            limit = 10, 
            page = 1, 
            fields, 
            name, 
            description, 
            minPrice, 
            maxPrice 
        } = req.query;

        const sortOrder = order === 'desc' ? -1 : 1;
        const skip = (page - 1) * limit;

        const projection = fields ? fields.split(',').join(' ') : '';

        // بناء الفلاتر للبحث
        const filters = {};
        if (name) {
            filters.name = { $regex: name, $options: 'i' };  // البحث في الاسم باستخدام تعبير عادي (case insensitive)
        }
        if (description) {
            filters.description = { $regex: description, $options: 'i' };  // البحث في الوصف باستخدام تعبير عادي
        }
        if (minPrice || maxPrice) {
            filters.price = {};
            if (minPrice) filters.price.$gte = minPrice;  // الحد الأدنى للسعر
            if (maxPrice) filters.price.$lte = maxPrice;  // الحد الأقصى للسعر
        }

        // استرجاع العدد الإجمالي للعناصر بناءً على الفلاتر
        const totalItems = await Product.countDocuments(filters); // عدد جميع المنتجات التي تطابق الفلاتر

        // حساب عدد الصفحات
        const totalPages = Math.ceil(totalItems / limit);

        // استرجاع المنتجات مع البحث، الفرز، التقسيم واختيار الحقول
        const products = await Product.find(filters)  // استخدام الفلاتر
            .sort({ [sortBy]: sortOrder }) // فرز حسب الحقل المحدد
            .skip(skip) // تخطي العناصر بناءً على الصفحة الحالية
            .limit(parseInt(limit)) // تحديد عدد العناصر في الصفحة
            .select(projection) // تحديد الحقول التي سيتم إرجاعها
            .populate('category , name').populate('subCategory, name'); // جلب معلومات الفئة والفئة الفرعية

        // إرجاع البيانات مع المعلومات المتعلقة بالباجنيشن
        res.json({
            totalItems,
            totalPages,
            currentPage: page,
            products
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * @desc    جلب منتج بواسطة ID
 * @route   GET /api/products/:id
 * @access  Private (Authenticated User)
 */
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category subCategory'); // جلب الفئات والفئات الفرعية المرتبطة

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * @desc    تعديل منتج بواسطة ID
 * @route   PUT /api/products/:id
 * @access  Private (Authenticated User)
 */
const updateProduct = async (req, res) => {
    try {
        const user = await User.findById(req.user);
        const isAdmin = user ? (user.role === "admin") : false;
        if(!isAdmin){
            return res.status(403).json({ message: "You are not admin to update product product" });
        }

        const { name, price, description, categoryId, stock, subCategoryId, colors, size, quantity, image } = req.body;

        const category = await Category.findById(categoryId);
        const subCategory = await SubCategory.findById(subCategoryId);

        if (!category || !subCategory) {
            return res.status(400).json({ message: 'Invalid category or subcategory' });
        }

        const product = await Product.findByIdAndUpdate(req.params.id, {
            name,
            price,
            description,
            category: categoryId,
            subCategory: subCategoryId,
            stock,
            colors,
            size,
            quantity,
            image
        }, { new: true });

        if (!product) return res.status(404).json({ message: 'Product not found' });

        res.json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * @desc    حذف منتج بواسطة ID
 * @route   DELETE /api/products/:id
 * @access  Private (Admin)
 */
const deleteProduct = async (req, res) => {
    try {
        const user = await User.findById(req.user);
        const isAdmin = user ? (user.role === "admin") : false;
        if(!isAdmin){
            return res.status(403).json({ message: "You are not admin to update product product" });
        }
        
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) return res.status(404).json({ message: 'Product not found' });

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { 
    createProduct, 
    getAllProducts, 
    getProductById, 
    updateProduct, 
    deleteProduct 
};
