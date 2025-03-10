const mongoose = require("mongoose");


const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Types.ObjectId, ref: "User", required: true },
  productId: { type: mongoose.Types.ObjectId, ref: "Product",required: true }, 
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
},{ timestamps: true });

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review