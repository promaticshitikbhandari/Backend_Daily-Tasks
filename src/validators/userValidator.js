import Joi from "joi";

//Schema for creating a user
const createUserSchema = Joi.object({
    username: Joi.string().min(2).max(50).trim().required(),
    fullName: Joi.string().min(2).max(50).trim().required(),
    email: Joi.string().email().trim().required().lowercase(),
    password: Joi.string().min(8).required(),
    role: Joi.string().trim().default('user').optional()
});

const getUserParamSchema = Joi.object({
    id: Joi.string().hex().length(24).required()
});

const changePasswordSchema = Joi.object({
    newPassword: Joi.string().min(8)
    // .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/)
    .required(),
    oldPassword: Joi.string().min(8).required()
})

export {
    createUserSchema,
    getUserParamSchema,
    changePasswordSchema,
}