const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    uId: { type: String },
    name: { type: String },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("category", categorySchema);