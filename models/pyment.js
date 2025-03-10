const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    paymentId: { type: String, required: true },
    payerId: { type: String, required: true },
    email: { type: String, required: true },
    amount: { type: String, required: true },
    currency: { type: String, required: true },
    status: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);
