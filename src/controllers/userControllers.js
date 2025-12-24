import { User } from "../models/userModel.js";
import { logActivity } from "../services/activityLog.services.js";
import { logAudit } from "../services/auditTrial.services.js";
import jwt from "jsonwebtoken";
import {generateAccessTokenAndRefreshToken} from "../utils/generateAccessAndRefreshToken.utils.js";

// const generateAccessTokenAndRefreshToken = async (userId) => {
//     try {
//         const user = await User.findById(userId);
//         const accessToken = await user.generateAccessToken();
//         const refreshToken = await user.generateRefreshToken();

//         user.refreshToken = refreshToken;
//         await user.save({validateBeforeSave: false})
//         // console.log(user);
//         return {accessToken, refreshToken}
        
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({
//             success: false,
//             message: "Something went wrong while generating Access Token And Refresh Token" 
//         })
//     }
// }

const register = async (req, res) => {
    try {

        const {username, fullName, email, password, role} = req.body;
        if([username, fullName, email, password].some( (field) => field?.trim() === "")) {
            return res.status(401).json({success: false, message: "All are Required Fields"});
        }
        
        const user = await User.findOne({
            $or: [{username, email}]
        })
        // console.log(password);

        if(user) return res.status(400).json({success: false, message: "User Already Exists"})

        const createUser = await User.create({username, fullName, email, password, role});

        const checkUser = await User.findById(createUser._id).select("-password").lean();

        
        return res.status(201).json({
            success: true,
            message: "New User Registered SuccessFully",
            data: checkUser
        })
        

        
    } catch (error) {
        console.log(error);
    }
}

const login = async (req, res) => {
    try {
        
        const {username, email, password} = req.body;

        if(!(username || email)) {
            return res.status(400).json({success: false, message: "Username or Email is Required"});
        }
        if(! password) {
            return res.status(400).json({success: false, message: "Password is Required"});
        }

        const user = await User.findOne({
            $or: [{username, email}]
        }).select("+password");

        if(!user) return res.status(404).json({success: false, message: "User not Found"});

        const matchPassword = await user.comparePassword(password);
        if(! matchPassword) return res.status(402).json({success: false, message: "Invalid credentials"});

        const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user._id);
        console.log(accessToken),
        console.log(refreshToken)
        // const accessToken = await user.generateAccessToken();
        const LoggedInUser = await User.findById(user._id).lean();

        const options = {
            httpOnly: true,
            secure: true
        }

        return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json({
            success: true,
            message: "LoggedIn Successfully",
            accessToken,
            refreshToken,
            data: LoggedInUser
        })

    } catch (error) {
        console.log(error);
    }
}

const refreshAccessToken = async (req, res) => {
    try {
        const {incomingRefreshToken} = req.body;
        if(!incomingRefreshToken) return res.status(400).json({
            success: false, message: "Refresh Token not Available"
        });

        const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decoded?._id);
        if(!user) return res.status(401).json({
            success: false, message: "Invalid Refresh Token"
        });

        if(incomingRefreshToken !== user.refreshToken) return res.status(401).json({
            success: false, message: "Refresh Token maybe Expired or Used"
        });

        const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user._id);
        const options = {
            httpOnly: true,
            secure: true
        };

        return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json({
            success: true,
            message: "Access Token refreshed"
        })


    } catch (error) {
        console.log(error.message),
        res.status(401).json({
            success: false,
            message: "Invalid Refresh Token"
        })
    }
}

const profile = async (req, res) => {
    try {
        const user = req.user;

        return res.status(200).json({
            success: true,
            message: "User is Authorized to access Profile page",
            data: user
        })
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    } 
}

const updateProfile = async (req, res) => {
    try {
        const user = req.user;
        console.log(user._id)

        const {username, email, fullName} = req.body;
        if(! (username || email || fullName)) {
            return res.status(400).json({success: false, message: "Atleast One field is Required to update"});
        }

        const updateProfile = await User.findByIdAndUpdate(
            user._id,
            {
                $set: ({username, email, fullName})
            },
            { new: true, runValidators: false}
        )
        logActivity({
            actorId: user?._id || null,
            actorRole: user?.role || null,
            action: "PROFILE_UPDATED",
            category: "PROFILE",
            description: "User Profile Updated",
            targetId: updateProfile._id,
            oldValues: user, 
            newValues: updateProfile,
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
        });
        logAudit({
            entityType: "Profile", 
            entityId: updateProfile._id, 
            action: "UPDATE", 
            changedBy: user?._id || null, 
            oldValues: user, 
            newValues: updateProfile
        });

        return res.status(200).json({
            success: true,
            message: "User's Profile Updated Successfully",
            data: updateProfile
        })
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

const changePassword = async (req, res) => {
    try {
        
        const user = req.user;
        const {newPassword, oldPassword} = req.body;

        if(!newPassword || !oldPassword) return res.status(400).json({success: false, message: "Both New and Old Password is required to change the password"})

        const newUser = await User.findById(user._id).select("+password");
        // console.log(newUser.password)
        // console.log(newUser.fullName)

        const checkPassword = await newUser.comparePassword(oldPassword);
        if(!checkPassword) return res.status(401).json({success: false, message: "Old Password is Incorrect"});

        newUser.password = await newPassword;
        await newUser.save();

        logActivity({
            actorId: user?._id,
            actorRole: user?.role,
            action: "Password_Changed",
            category: "Profile",
            description: "User Password Changed",
            targetId: newUser._id,
            oldValues: null,
            newValues: null,
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
        });

        return res.status(202).json({
            success: true, 
            message: "Password is Changed Successfully",
            data: newUser
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

export {
    register, 
    login,
    profile,
    updateProfile,
    changePassword,
    refreshAccessToken
}