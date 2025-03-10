const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const dbURI = process.env.DATABASE_URL;

        if (!dbURI) {
            throw new Error("❌ DATABASE_URL is not defined in .env file!");
        }

        await mongoose.connect(dbURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log("✅ MongoDB Connected Successfully");
    } catch (err) {
        console.error("❌ Database Connection Error:", err);
        process.exit(1);
    }
};

module.exports = connectDB;
