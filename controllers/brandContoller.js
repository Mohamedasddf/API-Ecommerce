const Brand = require("../models/brand");
const express = require('express');

/**
 * @desc    إنشاء براند جديد
 * @route   POST /api/brands
 * @access  Private (Admin)
 */
const createBrand = async (req, res) => {
    const user = await User.findById(req.user);
    const isAdmin = user ? (user.role === "admin") : false;
    if(!isAdmin){
        return res.status(403).json({ message: "You are not admin to create brand" });
    }

    const { name, description, logoUrl } = req.body;

    try {
        const brand = new Brand({ name, description, logoUrl });
        await brand.save();
        res.status(201).json(brand);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * @desc    الحصول على جميع البراندات
 * @route   GET /api/brands
 * @access  Public
 */
const getBrands =  async (req, res) => {
    try {
        const brands = await Brand.find();
        res.json(brands);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    الحصول على براند معين
 * @route   GET /api/brands/:id
 * @access  Pubic
 */
const getBrandById =  async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);
        if (!brand) return res.status(404).json({ message: 'Brand not found' });
        res.json(brand);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    تعديل براند
 * @route   PUT /api/brands/:id
 * @access  Private (Admin)
 */
const updateBrand =  async (req, res) => {
    try {
        const user = await User.findById(req.user);
        const isAdmin = user ? (user.role === "admin") : false;
        if(!isAdmin){
            return res.status(403).json({ message: "You are not admin to update brand" });
        }

        const { name, description, logoUrl } = req.body;
        const brand = await Brand.findByIdAndUpdate(
            req.params.id,
            { name, description, logoUrl },
            { new: true }
        );
        if (!brand) return res.status(404).json({ message: 'Brand not found' });
        res.json(brand);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * @desc    حذف براند
 * @route   DELETE /api/brands/:id
 * @access  Private (Admin)
 */
const deleteBrand = async (req, res) => {
    try {
        const user = await User.findById(req.user);
        const isAdmin = user ? (user.role === "admin") : false;
        if(!isAdmin){
            return res.status(403).json({ message: "You are not admin to delete brand" });
        }

        const brand = await Brand.findByIdAndDelete(req.params.id);
        if (!brand) return res.status(404).json({ message: 'Brand not found' });
        res.json({ message: 'Brand deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { deleteBrand, updateBrand, getBrandById, getBrands, createBrand };
