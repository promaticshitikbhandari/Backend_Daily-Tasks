import { Router } from "express";
import { changePassword, login, profile, refreshAccessToken, register, updateProfile } from "../controllers/userControllers.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { changePasswordSchema, createUserSchema, getUserParamSchema } from "../validators/userValidator.js";
import { createProduct, deleteProduct, getAllProducts, getMyProduct, updateProduct } from "../controllers/productControllers.js";
import upload from "../middleware/multerMiddleware.js";
import uploadFile from "../controllers/uploadControllers.js";
import activityLogMiddleware from "../middleware/logActivityMiddleware.js";
import rateLimit from "express-rate-limit";


const loginLimiter = rateLimit({
    windowMs: 15*60*1000,
    max: 5,
    message: {
        success: false,
        message: "Too many Login Attempts. Please try after 15 minutes"
    },
});


// console.log(typeof activityLogMiddleware)
const router = Router();

//login/signUp
router.post('/register', validate(createUserSchema, "body"), activityLogMiddleware({
    action: "USER_REGISTER",
    category: "AUTH",
    description: "New user registered"
}) ,register);

router.post('/login', loginLimiter, activityLogMiddleware({
    action: "USER_LOGIN",
    category: "AUTH",
    description: "User logged in successfull"
}), login);

//Refresh And Access Token generation
router.post('/refreshToken', refreshAccessToken);

//ProfileApi
router.get('/profile', authMiddleware, profile);

//UpdateProfile And ChangePassword
router.put('/updateProfile', authMiddleware, updateProfile);
router.post('/changePassword',authMiddleware, validate(changePasswordSchema),changePassword);


//Product Routes
router.post('/products/createProduct', authMiddleware, activityLogMiddleware({
    action: "PRODUCT_CREATED",
    category: "PRODUCT",
    description: "New product created"
}), createProduct);

router.get('/products/getMyProduct', authMiddleware, getMyProduct);
router.get('/products/getAllProduct', getAllProducts);

router.put('/products/updateProduct/:id', authMiddleware, validate(getUserParamSchema, "params"), updateProduct);
router.delete('/products/deleteProduct/:id', authMiddleware, validate(getUserParamSchema, "params"), deleteProduct);

router.get('/uploads', authMiddleware, activityLogMiddleware({
    action: "File Uploaded",
    category: "File",
    description: "New file uploaded"
}), upload.fields([
    {
        name: "file",
        maxCount: 2
    }
]), uploadFile)



export default router