const mongoose = require("mongoose");

const adminModel = new mongoose.Schema({
    uId: { type: String },
    name: { type: String },
    email: { type: String },
    password: { type: String },
    confirmPassword: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("admin", adminModel);