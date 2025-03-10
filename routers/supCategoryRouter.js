/**
 * @desc    إدارة التصنيفات الفرعية (إنشاء، عرض، تعديل، حذف)
 * @route   API Routes
 * @access  العمليات مفتوحة بدون تحقق
 */

const express = require('express');
const router = express.Router();
const { 
    creatSupCategory, 
    getSupCategory, 
    updateSubCategory, 
    deleteSubCategory, 
} = require('../controllers/supCategoryContoller');

/**
 * @route   POST /api/subcategories/
 * @desc    إنشاء تصنيف فرعي جديد
 * @access  Public
 */
router.post('/', creatSupCategory);

/**
 * @route   GET /api/subcategories/
 * @desc    جلب جميع التصنيفات الفرعية
 * @access  Public
 */
router.get('/', getSupCategory);

/**
 * @route   PUT /api/subcategories/:id
 * @desc    تعديل تصنيف فرعي معين
 * @access  Public
 */
router.put('/:id', updateSubCategory);

/**
 * @route   DELETE /api/subcategories/:id
 * @desc    حذف تصنيف فرعي معين
 * @access  Public
 */
router.delete('/:id', deleteSubCategory);

module.exports = router;
