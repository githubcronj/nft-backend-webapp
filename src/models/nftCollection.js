const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
    walletId: {type: String},
    collections: [],
    category: []
},{timestamps:true});

module.exports = mongoose.model('Collection', collectionSchema);
