const Address = require("../models/address");
const User = require("../models/Users");
/**
 * @desc    إنشاء عنوان جديد للمستخدم
 * @route   POST /api/address
 * @access  Private (User)
 */
const createAddress = async (req, res) => {
    try {
        const { fullName, phone, street, city, state, country, postalCode } = req.body;

        if (![fullName, phone, street, city, state, country, postalCode].every(Boolean)) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const address = new Address({
            user: req.user,
            fullName,
            phone,
            street,
            city,
            state,
            country,
            postalCode,
        });

        await address.save();
        res.status(201).json({ message: "Address added successfully", address });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    الحصول على عناوين المستخدم
 * @route   GET /api/address
 * @access  Private (User)
 */
const getAddress = async (req, res) => {
    try {
        const userId = req.user;
        const user = await User.findById(userId).lean();
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const address = await Address.find({ user: req.user }).lean();
        if (!address) {
            return res.status(404).json({ message: "User does not have an address" });
        }

        res.status(200).json({ address });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    تحديث عنوان المستخدم
 * @route   PUT /api/address/:addressId
 * @access  Private (User/Admin)
 */
const updateAddress = async (req, res) => {
    try {
        const { fullName, phone, street, city, state, country, postalCode } = req.body;

        if (![fullName, phone, street, city, state, country, postalCode].every(Boolean)) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const { addressId } = req.params;
        let address = await Address.findById(addressId);

        if (!address) {
            return res.status(404).json({ message: "Address not found" });
        }

        const user = await User.findById(req.user).lean();
        if (!user) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const isAdmin = user.role === "admin";

        if (address.user.toString() !== req.user.toString() && !isAdmin) {
            return res.status(403).json({ message: "You are not authorized to update this address" });
        }

        address.fullName = fullName || address.fullName;
        address.phone = phone || address.phone;
        address.street = street || address.street;
        address.city = city || address.city;
        address.state = state || address.state;
        address.country = country || address.country;
        address.postalCode = postalCode || address.postalCode;

        await address.save();
        res.json({ message: "Address updated successfully", address });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * @desc    حذف عنوان المستخدم
 * @route   DELETE /api/address/:addressId
 * @access  Private (User/Admin)
 */
const deleteAddress = async (req, res) => {
    try {
        const { addressId } = req.params;

        const address = await Address.findById(addressId);
        if (!address) {
            return res.status(404).json({ message: "Address not found" });
        }

        const user = await User.findById(req.user).lean();
        if (!user) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const isAdmin = user.role === "admin";

        if (address.user.toString() !== req.user.toString() && !isAdmin) {
            return res.status(403).json({ message: "You are not authorized to delete this address" });
        }

        await address.deleteOne();
        res.status(200).json({ message: "Address deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createAddress, getAddress, updateAddress, deleteAddress };
