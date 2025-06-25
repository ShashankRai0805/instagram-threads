const User = require("../models/user-model")
const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if(!token){
            return res.status(401).json({
                msg: "Authentication token is requires"
            })  
        }
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
        if(!decodedToken){
            return res.status(400).json({
                msg: "Invalid authentication token"
            })
        }
        const user = await User.findById(decodedToken.token).populate
        ('followers').populate('threads').populate('replies').populate
        ('reposts');
        if(!user){
            res.status(400).json({
                msg: "User not found"
            })
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(400).json({
            msg: "Error in authentication",
            err: error.message
        })
    }
}


module.exports = auth;