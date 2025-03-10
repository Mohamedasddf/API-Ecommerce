const mongoose = require('mongoose');
const slugify = require('slugify');
const Category = require('./category');
const Brand = require('./brand');

const subCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
        required: true
    },
    slug: {
        type: String,
        lowercase: true
    }
}, { timestamps: true });

// إنشاء slug تلقائيًا قبل الحفظ
subCategorySchema.pre('save', function (next) {
    if (this.name) {
        this.slug = slugify(this.name, { lower: true });
    }
    next();
});

const SubCategory = mongoose.model('SubCategory', subCategorySchema);
module.exports = SubCategory;
