const express = require("express");
const { signin, login, userDetails, followUser, updateProfile, searchUser, logout, myInfo } = require("./controllers/user-controller");
const auth = require("./middleware/auth");
const { addPost, allPost } = require("./controllers/post-controller");

const router = express.Router();

router.post("/signin", signin);
router.post("/login", login); 

router.get("/user/:id", auth, userDetails);
router.put("/user/follow/:id", auth, followUser)
router.put("/update", auth, updateProfile)
router.get("/user/search/:query", auth, searchUser)
router.post("/logout", auth, logout);
router.get("/me", auth, myInfo);

router.post("/post", auth, addPost);
router.get("/post", auth, allPost);

module.exports = router;