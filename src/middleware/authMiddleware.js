import jwt from "jsonwebtoken"
import { User } from "../models/userModel.js";

const authMiddleware = async (req, res, next) => {

    let token;
    if(req.headers && req.headers?.authorization && req.headers.authorization?.startsWith("Bearer")) {
        token = req.headers.authorization.split(' ')[1]
    }

    if(!token) return res.status(400).json({success: false, message: "Unauthorized User"});

    //Check whether Token is Valid or Not 
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
        const user = await User.findById(decoded._id);
        if(!user) return res.status(404).json({ success: false, message: "User not Found" });

        req.user = user;
        next();
        

    } catch (error) {
        console.log(error);
        return res.status(402).json({
            success: false,
            message: "Token is Invalid or Expired"
        })
    }
}

export {authMiddleware}