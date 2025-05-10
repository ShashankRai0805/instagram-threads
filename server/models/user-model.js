const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
    },
    bio: {
        type: String
    },
    profilePic: {
        type: String,
        default: "https://www.headshotpro.com/avatar-results/random-1.webp"
    },
    public_id: {
        type: String
    },
    followers: [{type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    threads: [{type: mongoose.Schema.Types.ObjectId, red: "post"}],
    replies: [{type: mongoose.Schema.Types.ObjectId, red: "comment"}],
    reposts: [{type: mongoose.Schema.Types.ObjectId, red: "post"}],
},
{timestamps: true});

module.exports = mongoose.model("user", userSchema);