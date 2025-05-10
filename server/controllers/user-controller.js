const User = require("../models/user-model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")

exports.signin = async (req, res) =>{
    try{
        const { username, email, password } = req.body;
        if(!username || !email || !password){
            return res.status(400).json({
                msg: "Username, email, password are required!!"
            })
        }
        const userExists = await User.findOne({email});
        if(userExists){
            return res.status(400).json({
                msg: "User already Exists"
            });
        }
        const hashPassword = await bcrypt.hash(password, 10);
        if(!hashPassword){
            return res.status(400).json({
                msg: "Error in password hashing"
            });
        }
        const user = new User({
            username,
            email,
            password: hashPassword
        })
        const result = await user.save();
        if(!user){
            return res.status(400).json({
                msg: "Error in saving user.."
            });
        }
        const accesToken = jwt.sign({token: result._id}, process.env.JWT_SECRET, {
            expiresIn: "30d",
        });
        if(!accesToken){
            return res.status(400).json({
                msg: "Error while creating access token"
            })
        }
        res.cookie('token', accesToken, {
            maxAge: 1000*60*60*24*30,
            httpOnly: true,
            sameSite: "none",
            secure: true
        });
        res.status(201).json({
            msg: `User Signed in successfully!! Hello ${result?.username}`
        })
    } catch(err){
        res.status(400).json({
            msg: "Error in signin !",
            err: err.message
        })
    }
}

exports.login = async (req, res) =>{
    try{
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(400).json({
                msg: "Email and password are required!!"
            })
        }
        const userExists = await User.findOne({email});
        if(!userExists){
            return res.status(400).json({
                msg: "Please signin first!!"
            });
        }
        const passwordMatched = await bcrypt.compare(password, userExists.password);
        if(!passwordMatched){
            res.status(400).json({
                msg: "Incorrect credentials!!"
            })
        }
        const accesToken = jwt.sign({token: userExists._id}, process.env.JWT_SECRET, {
            expiresIn: "30d"
        })
        if(!accesToken){
            return res.status(400).json({
                msg: "Error creating the token"
            })
        }
        res.cookie('token', accesToken, {
            maxAge: 1000*60*60*24*30,
            httpOnly: true,
            secure: true,
            sameSite: "none",
        });
        res.status(200).json({
            msg: "User logged in successfully!!"
        })
    } catch (err){
        res.status(400).json({
            msg: "Error in login!!", err: err.message
        })
    }
}

exports.userDetails = async (req, res) => {
    try{
        const { id } = req.params;
        if(!id){
            return res.status(400).json({
                msg: "Id is required"
            });
        }
        const user = await User.findById(id)
            .select('-password')
            .populate("followers")
            .populate({
                path: "threads", 
                populate: [{path: "likes"}, {path: "comments"}, {path: "admin"}],
            })
            .populate({ path: "replies", populate: {path: "admin"} })
            .populate({ path: "reposts", populate: [{path: "likes"}, {path: "comments"}, {path: "admin"}] 
            });
        res.status(200).json({
            msg: "User details fetched...", 
            user
        })
    } catch (err){
        res.status(400).json({
            msg: "Error in user details!!", err: err.message
        });
    }
}