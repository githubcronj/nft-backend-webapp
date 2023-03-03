const mongoose = require("mongoose");
const transactionModel = new mongoose.Schema({
    uId:{type:String},
    tokenId:{type:String},
    price:{type:String},
    from:{type:String},
    to:{type:String}
},{timestamps:true});

module.exports = mongoose.model("transaction",transactionModel);
