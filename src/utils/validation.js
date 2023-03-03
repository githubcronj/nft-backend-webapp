const joi = require('joi');


const createUserValidation = (data) => {
    const schema = joi.object({
        address: joi.string(),
        twitter: joi.string(),
        name: joi.string(),
        profile: joi.string(),
        holdings: joi.array(),
        bio: joi.string(),
        personalUrl: joi.string(),
        verified: joi.string()
    })
    return schema.validate(data);
}

const adminValidation = (data) => {
    const schema = joi.object({
        name: joi.string(),
        email: joi.string().email(),
        password: joi
            .string()
            .min(8)
            .max(25)
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                "password"
            ),
        confirmPassword: joi.string().valid(joi.ref("password"))
    });
    return schema.validate(data);
}

const loginValidation = (data) => {
    const schema = joi.object({
        email: joi.string().email(),
        password: joi.string()
    });
    return schema.validate(data);
}

const updateUserValidation = (data) => {
    const schema = joi.object({
        address: joi.string(),
        twitter: joi.string(),
        name: joi.string(),
        profile: joi.string(),
        holdings: joi.array(),
        bio: joi.string(),
        personalUrl: joi.string(),
        verified: joi.string()
    })
    return schema.validate(data);
}

const createCategoryValidation = (data) => {
    const schema = joi.object({
        category: joi.array().items(joi.string()),
        collections: joi.array().items(joi.string())
    })
    return schema.validate(data);
}


module.exports = {
    createUserValidation,
    createCategoryValidation,
    updateUserValidation,
    adminValidation,
    loginValidation
}