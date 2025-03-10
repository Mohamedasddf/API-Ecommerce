require("dotenv").config();
const paypal = require("paypal-rest-sdk");

paypal.configure({
    mode: process.env.PRODUCTION_MODE, // sandbox أو live
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.SECRET_KEY
});

module.exports = paypal;
