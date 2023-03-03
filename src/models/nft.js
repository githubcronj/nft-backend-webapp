const mongoose = require('mongoose');

const allNftsSchema = new mongoose.Schema({
    category: {type:String},
    collections: [],
    date: {type:String},
    description: {type:String},
    image: {type:String},
    name: {type:String},
    owner: {type:String},
    price: {type:String},
    seller: {type:String},
    tokenId: {type:String},
    tokenURI: {type:String},
    walletId: {type:String}

},{timestamps: true})

module.exports = mongoose.model('All-NFT',allNftsSchema);