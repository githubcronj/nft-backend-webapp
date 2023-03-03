const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    uId:{type:String},
    address: {type:String},
    name: {type:String},
    profile: {type:String},
    holdings: [],
    twitter:{type:String},
    bio:{type:String},
    personalUrl:{type:String},
    verified:{type:String,enum:["yes","no"]},
    isBlocked:{type:Boolean,default:false}
}, {timestamps: true});

module.exports = mongoose.model('User',userSchema);