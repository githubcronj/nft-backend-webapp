const userModel = require('../models/user');
const { createUserValidation } = require('../utils/validation');
const { v4: uuidv4 } = require("uuid");
const { statusCodes } = require("../utils/utility");


const createUser = async (req, res) => {
    try {
        const { error } = createUserValidation(req.body);
        if (error) return res.status(statusCodes[400].value).send(error.details[0].message);
        const uniqueAddress = await userModel.findOne({ address: req.body.address });
        if (uniqueAddress !== null) return res.status(statusCodes[400].value).send({ message: `User already registered` });
        req.body.uId = uuidv4();
        const data = await userModel.create(req.body);
        return res.send({ status: `success`, data });
    } catch (error) {
        console.log(error);
        return res.status(statusCodes[500].value).json({ message: `Internal Server Error` });
    }
}

const getUser = async (req, res) => {
    try {
        const usersData = await userModel.findOne({ address: req.params.address })
        if (usersData === null) return res.status(statusCodes[404].value).send({ message: "User Not Found" })
        return res.status(statusCodes[200].value).send({ message: "Success", data: usersData })
    } catch (error) {
        console.log(error);
        return res.status(statusCodes[500].value).json({ message: `Internal Server Error` });
    }
}


module.exports = {
    createUser,
    getUser
}