const User = require("../models/user-model");
const Post = require("../models/post-model");
const Comment = require("../models/comment-model");
const formidable = require("formidable");
const cloudinary = require("../config/cloudinary");


exports.addPost = async (req, res)=>{
    try {
        const form = formidable({});
        form.parse(req, async (err, fields, files)=>{
            if(err){
                return res.status(400).json({
                    msg: "Error in parsing form"
                })
            }
            const post = new Post();
            if(fields.text){
                post.text = fields.text;
            }
            if(files.media){
                const uploadedImage = await cloudinary.uploader.upload(files.media.filepath, {folder: "INSTAGRAM-THREADS/Posts"});
                if(!uploadedImage){
                    return res.status(400).json({
                        msg: "Error in uploading image"
                    })
                }
                post.media = uploadedImage.secure_url;
                post.public_id = uploadedImage.public_id;
            }
            post.admin = req.user._id;
            const newPost = await post.save();
            await User.findByIdAndUpdate(req.user._id, {
                $push: {threads: newPost._id}
            }, {new: true})
            res.status(201).json({
                msg: "Post added successfully",
                newPost
            })
        })
    } catch (error) {
        res.status(400).json({
            msg: "Error in adding post",
            err: error.message
        })
    }
}

exports.allPost = async (req, res)=>{
    try {
        const {page} = req.query;
        let pageNumber = page;
        if(!page || page === undefined){
            pageNumber = 1;
        }
        const posts = await Post.find({}).sort({createdAt: -1}).skip((pageNumber-1)*3).limit(3).
        populate("admin").populate("likes").populate({
            path: "comments",
            populate: {
                path: "admin",
                model: "user"
            }
        })
        res.status(200).json({
            msg: "Posts fetched successfully",
            posts,
        })
    } catch (error) {
        res.status(400).json({
            msg: "Error in fetching posts",
            err: error.message
        })
    }
}

exports.deletePost = async (req, res)=>{
    try {
        const {id} = req.params;
        if(!id){
            res.status(400).json({
                msg: "id is required"
            })
        }
        const postExists = await Post.findById(id);
        if(!postExists){
            return res.status(400).json({
                msg: "Post does not exists"
            })
        }
        const userId = req.user._id.toString();
        const adminId = postExists.admin._id.toString();
        if(userId!== adminId){
            return res.status(400).json({
                msg: "You are not authorized to delete this post"
            })
        }
        if(postExists.media){
            await cloudinary.uploader.destroy(postExists.public_id, (error, result)=>{
                console.log("{error, result}");
            })
        }
        await Comment.deleteMany({_id: {$in: postExists.comments}})
    } catch (error) {
        res.status(400).json({
            msg: "Error in deleting post",
            err: error.message
        })
    }
}