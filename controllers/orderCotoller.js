const Order = require("../models/order");
const Cart = require("../models/cart");
const Product = require("../models/product");
const User = require("../models/Users");

/**
 * @desc    إنشاء طلب جديد من عناصر العربة
 * @route   POST /api/orders
 * @access  Private (Authenticated User)
 */
const createOrder = async (req, res) => {
    try {
        const userId = req.user;
        const user = await User.findById(userId);
        const isAdmin = user ? (user.role === "admin") : false;

        if ( !user && !isAdmin) {
            return res.status(403).json({ message: "You are not authorized to create this order" });
        }

        const cartItems = await Cart.find({ user: user._id }).populate('productId');
        
        if (cartItems.length === 0) {
            return res.status(400).json({ message: 'Your cart is empty' });
        }

        let totalAmount = 0;
        const orderProducts = cartItems.map((item) => {
            const product = item.productId;
            const totalProductPrice = product.price * item.quantity;
            
            const colors = Array.isArray(item.color) ? item.color : [item.color];
            
            totalAmount += totalProductPrice;

            return {
                productId: product._id,
                productName: product.name,
                price: product.price,
                quantity: item.quantity,
                color: colors,
                total: totalProductPrice,
            };
        });

        const order = new Order({
            user: userId,
            products: orderProducts,
            totalAmount: totalAmount,
            status: "pending"
        });

        await order.save();

        res.status(201).json({
            message: 'Order created successfully',
            order,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error occurred while creating the order' });
    }
};

/**
 * @desc    جلب جميع الطلبات الخاصة بالمستخدم مع التصفية والتقسيم إلى صفحات
 * @route   GET /api/orders
 * @access  Private (Authenticated User)
 */
const getAllOrder = async (req, res) => {
    try {
        const userId = req.user;
        const user = await User.findById(userId);
        const isAdmin = user ? (user.role === "admin") : false;

        if ( !user && !isAdmin) {
            return res.status(403).json({ message: "You are not authorized to delete this review" });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status || null;

        const query = { user: user._id };
        if (status) {
            query.status = status;
        }

        const totalOrders = await Order.countDocuments(query);

        const orders = await Order.find(query)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 });

        res.status(200).json({
            orders,
            pagination: {
                totalOrders,
                totalPages: Math.ceil(totalOrders / limit),
                currentPage: page,
                ordersPerPage: limit
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error occurred while retrieving orders" });
    }
};

/**
 * @desc    جلب طلب معين عبر ID
 * @route   GET /api/orders/:orderId
 * @access  Private (Authenticated User)
 */
const getOrderById = async (req, res) => {
    try {
        const userId = req.user;
        const user = await User.findById(userId);
        const isAdmin = user ? (user.role === "admin") : false;

        if ( !user && !isAdmin) {
            return res.status(403).json({ message: "You are not authorized to get this order" });
        }

        const { orderId } = req.params;
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({ order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error occurred while retrieving the order" });
    }
};

/**
 * @desc    تحديث حالة الطلب
 * @route   PUT /api/orders/:orderId/status
 * @access  Private (Admin)
 */
const updateOrderStatus = async (req, res) => {
    try {
        const userId = req.user;
        const user = await User.findById(userId);
        const isAdmin = user ? (user.role === "admin") : false;

        if ( !user && !isAdmin) {
            return res.status(403).json({ message: "You are not authorized to update this order" });
        }

        const { orderId } = req.params;
        const { status } = req.body;

        const validStatuses = ['pending', 'completed', 'cancelled', 'delivered'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid order status" });
        }

        const order = await Order.findByIdAndUpdate(
            orderId,
            { status: status },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({ message: "Order status updated successfully", order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error occurred while updating order status" });
    }
};

/**
 * @desc    حذف طلب معين
 * @route   DELETE /api/orders/:orderId
 * @access  Private (Admin)
 */
const deleteOrder = async (req, res) => {
    try {
        const userId = req.user;
        const user = await User.findById(userId);
        const isAdmin = user ? (user.role === "admin") : false;

        if ( !isAdmin) {
            return res.status(403).json({ message: "You are not admin to delete this order" });
        }

        const { orderId } = req.params;

        const order = await Order.findByIdAndDelete(orderId);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error occurred while deleting the order" });
    }
};

/**
 * @desc    جلب الطلبات المكتملة أو المسلمة
 * @route   GET /api/orders/completed
 * @access  Private (Authenticated User)
 */
const getOrderCompleted = async (req, res) => {
    try {
        const userId = req.user;
        const user = await User.findById(userId);

        const orders = await Order.find({
            user: user._id,
            status: { $in: ["completed", "delivered"] }
        });

        if (!orders.length) {
            return res.status(400).json({ message: "No completed or delivered orders for this user" });
        }

        res.status(200).json({ orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error occurred while retrieving order history" });
    }
};

module.exports = { 
    createOrder, 
    getAllOrder, 
    getOrderById, 
    updateOrderStatus, 
    deleteOrder, 
    getOrderCompleted
};

