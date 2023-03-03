const userModel = require("../models/user");
const nftModel = require("../models/nft");
const adminModel = require("../models/admin");
const { updateUserValidation, adminValidation, loginValidation } = require("../utils/validation");
const { statusCodes, jwtUtils, countDashboard } = require("../utils/utility");
const { v4: uuidv4 } = require("uuid");
const transactionModel = require("../models/transactions");
const categoryModel = require("../models/category");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const bcrypt = require("bcrypt");

const registerAndLoginAdmin = async (req, res) => {
    try {
        const { error } = adminValidation(req.body);
        if (error) {
            return res.status(statusCodes[400].value).send({ msg: error.details[0].message });
        }
        req.body.uId = uuidv4();
        const checkUnique = await adminModel.findOne({ email: req.body.email });
        if (checkUnique !== null) {
            return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: "User Already Registered" });
        }
        req.body.password = await bcrypt.hash(req.body.password, 5);
        const saveData = await adminModel.create(req.body);
        let payload = { userId: saveData._id };
        let tokenData = jwt.sign(payload, jwtUtils.secretKey, { expiresIn: jwtUtils.time });
        if (tokenData) {
            return res.status(statusCodes[200].value).send({ status: statusCodes[200].message, data: saveData, token: tokenData });
        }
    } catch (err) {
        return res.status(statusCodes[500].value).send({ status: statusCodes[500].message, message: err.message });
    }
}

const login = async (req, res) => {
    try {
        const { error } = loginValidation(req.body);
        if (error) return res.status(statusCodes[400].value).send({
            status: statusCodes[400].message,
            message: error.details[0].message
        });
        const authenticate = await adminModel.findOne({ email: req.body.email });
        if (authenticate === null) {
            return res.status(statusCodes[404].value).send({ status: statusCodes[404].message, message: "No User Found" });
        } else {
            const decryptPassword = await bcrypt.compare(req.body.password, authenticate.password);
            if (!decryptPassword) {
                return res.status(statusCodes[401].value).send({ status: statusCodes[401].message, messaage: "Incorrect email or password" });
            }
        }
        const tokenData = jwt.sign({ userId: authenticate._id }, jwtUtils.secretKey, { expiresIn: jwtUtils.time });
        return res.status(statusCodes[200].value).send({ status: statusCodes[200].message, data: tokenData });
    } catch (error) {
        return res.status(statusCodes[500].value).send({ status: statusCodes[500].message, message: error.message });
    }
}

const getUserList = async (req, res) => {
    try {
        const data = await userModel.find({ isBlocked: false });
        if (data.length !== 0) {
            const page = parseInt(req.query.page);
            const limit = parseInt(req.query.limit);
            const startindex = (page - 1) * limit;
            const endIndex = page * limit;
            const result = {};
            if (endIndex < data.length) {
                result.next = {
                    page: page + 1,
                    limit: limit
                };
            }
            if (startindex > 0) {
                result.previous = {
                    page: page - 1,
                    limit: limit
                };
            }
            result.results = await userModel.find({ isBlocked: false }).limit(limit).skip(startindex).select({ _id: 0 });
            return res.status(statusCodes[200].value).send({ status: statusCodes[200].message, data: result });
        } else {
            return res.status(statusCodes[404].value).send({ status: statusCodes[404].message, msg: "NotFound" });
        }
    } catch (err) {
        console.log(err);
        return res.status(statusCodes[500].value).send({ status: statusCodes[500].message, msg: err.messaage });
    }
}

const getUserById = async (req, res) => {
    try {
        const data = await userModel.findOne({ uId: req.params.id });
        if (data !== null) {
            return res.status(statusCodes[200].value).send({ status: statusCodes[200].message, data: data });
        } else {
            return res.status(statusCodes[404].value).send({ status: statusCodes[404].message, msg: "NotFound" });
        }
    } catch (err) {
        console.log(err);
        return res.status(statusCodes[500].value).send({ status: statusCodes[500].message, msg: err.messaage });
    }
}

const updateUser = async (req, res) => {
    try {
        const { error } = updateUserValidation(req.body);
        if (error) {
            return res.status(statusCodes[400].value).send({ msg: error.details[0].message })
        }
        const data = await userModel.findOneAndUpdate({ address: req.params.address }, req.body, { new: true });
        if (data.matchedCount !== 0) {
            return res.status(statusCodes[200].value).send({ status: statusCodes[200].message, msg: "Data Successfully Updated" });
        } else {
            return res.status(statusCodes[404].value).send({ status: statusCodes[404].message, msg: "NotFound" });
        }
    } catch (err) {
        console.log(err);
        return res.status(statusCodes[500].value).send({ status: statusCodes[500].message, msg: err.messaage });
    }
}

const blockUser = async (req, res) => {
    try {
        const data = await userModel.findOneAndUpdate({ $and: [{ uId: req.params.id }, { isBlocked: false }] }, { isBlocked: true }, { new: true });
        // console.log(data);
        if (data === null) {
            return res.status(statusCodes[404].value).send({ status: statusCodes[404].message, msg: "not Found" });
        }
        return res.status(statusCodes[200].value).send({ status: statusCodes[200].message, msg: "user Successfully blocked" });
    } catch (error) {
        console.log(error);
        return res.status(statusCodes[500].value).send({ status: false, msg: "Internal Server Error", msg2: error.message });
    }
}

const getAllNft = async (req, res) => {
    const data = await nftModel.find();
    res.send(data)
}

const getUserNfts = async (req, res) => {
    try {
        const data = await nftModel.find({ address: req.params.address });
        if (data !== null) {
            return res.status(statusCodes[200].value).send({ status: statusCodes[200].message, data: data });
        } else {
            return res.status(statusCodes[404].value).send({ status: statusCodes[404].message, msg: "Not Found" });
        }
    } catch (error) {
        console.log(error);
        return res.status(statusCodes[500].value).send({ status: statusCodes[500].message, msg: error.message });
    }
}


const createCategory = async (req, res) => {
    try {
        let data = req.body;
        if (Object.keys(data).length === 0) {
            return res.status(statusCodes[404].value).send({ status: statusCodes[404].message });
        }
        data.uId = uuidv4();
        const saveData = await categoryModel.create(data);
        return res.status(statusCodes[201].value).send({ status: statusCodes[201].message, data: saveData });
    } catch (err) {
        console.log(err);
        return res.status(statusCodes[500].value).send({ status: statusCodes[500].message, message: err.message });
    }
}

const getCategoryById = async (req, res) => {
    try {
        const data = await categoryModel.findOne({ uId: req.params.id });
        if (data === null) {
            return res.status(statusCodes[404].value).send({ status: statusCodes[404].message });
        }
        return res.status(statusCodes[201].value).send({ status: statusCodes[201].message, data: data });
    } catch (err) {
        console.log(err);
        return res.status(statusCodes[500].value).send({ status: statusCodes[500].message, message: err.message });
    }
}

const updateCategory = async (req, res) => {
    try {
        let data = req.body;
        if (Object.keys(data).length === 0) {
            return res.status(statusCodes[404].value).send({ status: statusCodes[404].message });
        }
        const findData = await categoryModel.findOneAndUpdate({ uId: req.params.id }, data, { new: true });
        if (findData === null) {
            return res.status(statusCodes[404].value).send({ status: statusCodes[404].message });
        } else {
            return res.status(statusCodes[200].value).send({ status: statusCodes[200].message, data: findData });
        }
    } catch (err) {
        console.log(err);
        return res.status(statusCodes[500].value).send({ status: statusCodes[500].message, message: err.message });
    }
}

const deleteCategory = async (req, res) => {
    try {
        const findData = await categoryModel.findOneAndUpdate({ uId: req.params.id }, { isDeleted: true }, { new: true });
        if (findData === null) {
            return res.status(statusCodes[404].value).send({ status: statusCodes[404].message });
        } else {
            return res.status(statusCodes[200].value).send({ status: statusCodes[200].message, data: findData });
        }
    } catch (err) {
        console.log(err);
        return res.status(statusCodes[500].value).send({ status: statusCodes[500].message, message: err.message });
    }
}

const getCategory = async (req, res) => {
    try {
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
        const startindex = (page - 1) * limit;
        const endIndex = page * limit;
        const nftData = await categoryModel.find({ isDeleted: false });
        if (nftData.length === 0) {
            return res.status(statusCodes[404].value).send({ status: statusCodes[404].message });

        }
        const result = {};
        if (endIndex < nftData.length) {
            result.next = {
                page: page + 1,
                limit: limit
            };
        }
        if (startindex > 0) {
            result.previous = {
                page: page - 1,
                limit: limit
            };
        }
        result.results = await categoryModel.find({ isDeleted: false }).limit(limit).skip(startindex);
        return res.status(statusCodes[200].value).send({ status: statusCodes[200].message, data: result });
    } catch (err) {
        console.log(err);
        return res.status(statusCodes[500].value).send({ status: statusCodes[500].message, message: err.message });
    }
}

const createTransaction = async (req, res) => {
    try {
        let data = req.body;
        if (Object.keys(data).length === 0) {
            return res.status(statusCodes[404].value).send({ status: statusCodes[404].message });
        }
        const createData = await transactionModel.create(data);
        return res.status(statusCodes[201].value).send({ status: statusCodes[201].message, data: createData });
    } catch (err) {
        console.log(err);
        return res.status(statusCodes[500].value).send({ status: statusCodes[500].message, msg: err.message });
    }
}

const getTransaction = async (req, res) => {
    try {
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
        const startindex = (page - 1) * limit;
        const endIndex = page * limit;
        const nftData = await transactionModel.find();
        const result = {};
        if (endIndex < nftData.length) {
            result.next = {
                page: page + 1,
                limit: limit
            };
        }
        if (startindex > 0) {
            result.previous = {
                page: page - 1,
                limit: limit
            };
        }
        result.results = await transactionModel.find().limit(limit).skip(startindex);
        return res.status(statusCodes[200].value).send({ status: statusCodes[200].message, data: result });
    } catch (err) {
        console.log(err);
        return res.status(statusCodes[500].value).send({ status: statusCodes[500].message, message: err.message });
    }

}

const dashboard = async (req, res) => {
    try {
        let today = new Date();
        let fromDate = new Date(req.query.date);
        const userDataCount = await userModel.aggregate([
            {
                '$match': {
                    '$and': [
                        { createdAt: { '$lt': today } },
                        { createdAt: { '$gt': fromDate } }
                    ],
                }
            },
            {
                '$project': {
                    'month': {
                        '$month': '$createdAt'
                    },
                    'year': {
                        '$year': '$createdAt'
                    }
                }
            }, {
                '$group': {
                    '_id': {
                        'month': '$month',
                        'year': '$year'
                    },
                    'total': {
                        '$sum': 1
                    },
                }
            },
            {
                "$sort": {
                    "_id.year": 1,
                    "_id.month": 1
                }
            }
        ]);
        let userCount = countDashboard(userDataCount);
        const nftDataCount = await nftModel.aggregate([
            {
                '$match': {
                    '$and': [
                        { createdAt: { '$lt': today } },
                        { createdAt: { '$gt': fromDate } }
                    ],
                }
            },
            {
                '$project': {
                    'month': {
                        '$month': '$createdAt'
                    },
                    'year': {
                        '$year': '$createdAt'
                    }
                }
            }, {
                '$group': {
                    '_id': {
                        'month': '$month',
                        'year': '$year'
                    },
                    'total': {
                        '$sum': 1
                    },
                }
            },
            {
                "$sort": {
                    "_id.year": 1,
                    "_id.month": 1
                }
            }
        ]);
        let nftCount = countDashboard(nftDataCount);
        const nftDetails = await nftModel.find().select({ name: 1, image: 1, _id: 0 });
        const totalUsers = await userModel.find();
        const totalNft = await nftModel.find();
        const countCollections = await nftModel.find().distinct("collections");
        const countCategories = await categoryModel.find({ isDeleted: false });
        return res.status(statusCodes[200].value).send({ status: statusCodes[200].message, graphTable: { usersData: userCount, nftData: nftCount }, totalUsers: totalUsers.length, totalNft: totalNft.length, numberOfCollection: countCollections.length, numberOfCategory: countCategories.length, nftDetails: nftDetails });
    } catch (err) {
        console.log(err);
        return res.status(statusCodes[500].value).send({ status: statusCodes[500].message, message: err.message });
    }
}

const searchUser = async (req, res, next) => {
    try {
        const { name, address, bio, personalUrl, page = page, limit = limit } = req.query;

        const queryFilter = {};
        queryFilter.isDeleted = false;

        if (name) {
            queryFilter.name = { $regex: name, $options: "i" };
        }

        if (address) {
            queryFilter.address = { $regex: address, $options: "i" };
        }

        if (bio) {
            queryFilter.bio = { $regex: bio, $options: "i" };
        }
        if (personalUrl) {
            queryFilter.personalUrl = { $regex: personalUrl, $options: "i" };
        }

        let result = await userModel
            .find(queryFilter)
            .limit(limit * 1)
            .skip((page - 1) * limit);
        if (result.length === 0) {
            return res.status(statusCodes[404].value).send({ status: statusCodes[404].message });
        }
        return res.status(statusCodes[200].value).send({ data: result });
    } catch (error) {
        console.log(error);
        return res.status(statusCodes[500].value).send({ status: statusCodes[500].message, message: error.message });
    }
};

module.exports = {
    registerAndLoginAdmin,
    getUserById,
    getUserList,
    updateUser,
    blockUser,
    getUserNfts,
    getAllNft,
    getCategory,
    createTransaction,
    getTransaction,
    createCategory,
    getCategoryById,
    updateCategory,
    deleteCategory,
    login,
    dashboard,
    searchUser
}