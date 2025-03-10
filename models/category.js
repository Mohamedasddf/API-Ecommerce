const mongoose = require("mongoose");
const slugify = require("slugify");

const categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Category name is required"],
        unique: true,
        minlength: [5, "Category name must be at least 5 characters"]
    },
    slug: {
        type: String,
        lowercase: true
    }
}, { timestamps: true });

// إنشاء slug تلقائيًا قبل الحفظ
categorySchema.pre("save", function (next) {
    if (this.name) {
        this.slug = slugify(this.name, { lower: true });
    }
    next();
});

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
