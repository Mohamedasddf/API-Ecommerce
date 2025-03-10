const mongoose = require('mongoose');
const slugify = require('slugify');
const Category = require('./category');
const SubCategory = require('./supCategory');

const productSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    price: { 
        type: Number, 
        required: true,
        min: [0.01, 'Price must be positive']
    },
    description: { 
        type: String 
    },
    quantity: { 
        type: Number,
        default: 0 
    },
    stock: { 
        type: Number, 
        required: true 
    },
    slug: { 
        type: String, 
        lowercase: true, 
        unique: true 
    },
    category: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Category', 
        required: true 
    },
    subCategory: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'SubCategory', 
        required: true 
    },
    brand: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Brand', 
        required: true 
    },
    colors: [{ 
        type: String 
    }],
    size: { 
        type: String, 
        required: true
    },
    image: { 
        type: String,
        match: [/^https?:\/\/.+\.(jpg|jpeg|png|gif)$/, 'Please enter a valid image URL']
    },
}, { timestamps: true });

// إنشاء slug تلقائيًا قبل الحفظ
productSchema.pre('save', function (next) {
    if (this.name) {
        this.slug = slugify(this.name, { lower: true });
    }
    next();
});

// // إضافة وظيفة لملء الفئات الفرعية والفئة الرئيسية أثناء الاستعلام
// productSchema.pre('findOne', function (next) {
//     this.populate('category subCategory');
//     next();
// });

// productSchema.pre('findById', function (next) {
//     this.populate('category subCategory');
//     next();
// });

// // إضافة وظيفة لاستعلام المنتجات مع ملء الفئات تلقائيًا
// productSchema.pre('find', function (next) {
//     this.populate('category subCategory');
//     next();
// });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
