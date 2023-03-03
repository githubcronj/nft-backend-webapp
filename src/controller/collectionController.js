const collectionModel = require('../models/nftCollection');
const { createCategoryValidation } = require('../utils/validation');
const nftModel = require('../models/nft');
const { statusCodes } = require("../utils/utility");



const createCollection = async (req, res) => {
    try {
        const { error } = createCategoryValidation(req.body);
        if (error) return res.status(statusCodes[400].value).send(error.details[0].message);
        const uniqueCollection = await collectionModel.findOne({ collections: req.body.collections });
        if (uniqueCollection !== null) return res.send(400).send({ message: `Collection already registered` });
        const data = await nftModel.findOneAndUpdate({ walletId: req.params.id }, { $push: req.body }, { new: true });
        res.send({ status: `success`, data: data });

    } catch (error) {
        return res.status(statusCodes[500].value).json({ message: `Internal Server Error` });
    }
}


const getCollection = async (req, res) => {
    try {
        const data = await nftModel.find({ walletId: req.params.id }).distinct("collections")
        if (data.length === 0) return res.status(statusCodes[404].value).send({ message: `No collection found` });
        return res.send({ message: `success`, data: data });
    } catch (error) {
        console.log(error);
        return res.status(statusCodes[500].value).json({ message: `Internal Server Error` });
    }
};

const getAllCollections = async (req, res) => {
    try {
        const data = await nftModel.find().distinct("collections");
        if (!data) return res.status(statusCodes[404].value).send({ message: `No data found` });
        return res.send({ message: `success`, data: data })
    } catch (error) {
        return res.status(statusCodes[500].value).json({ message: `Internal Server Error` });
    }
}

module.exports = {
    createCollection,
    getCollection,
    getAllCollections
}