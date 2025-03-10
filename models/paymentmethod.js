const mongoose = require("mongoose");

const paymentMethodSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    method: {
        type: String,
        enum: ["paypal", "stripe", "cash_on_delivery", "vodafone_cash"],
        required: true
    },
}, {timestamps: true});

const PaymentMethod = mongoose.model("PaymentMethod", paymentMethodSchema);

module.exports = PaymentMethod;
