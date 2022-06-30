const express = require("express");
const { Post } = require("../Model/postModel");
const router = express.Router();
const { User } = require("../Model/userModel");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dad9nftzp",
  api_key: "396493191316594",
  api_secret: "JnSlR49PdlnJugNtYuIuLUGLYOw",
  secure: true,
});

router.get("/", async (req, res) => res.send("hello"));

//add/upload post

router.route("/:userId/upload").post(async (req, res) => {
  try {
    //image
    const { userId } = req.params;
    const { postText } = req.body;
    let postContent = {
      postText: postText,
      author: userId,
      timeStamp: new Date(),
    };
    const file = req?.files?.photo;
    if (file) {
      await cloudinary.uploader.upload(file.tempFilePath, async (err, result) => {
        if (result) {
          postContent = {
            ...postContent,
            postImage: result.secure_url,
          };
        }else{
            console.log("Error occurred while uploading file");
            res.status(500).json({
              status: false,
              message: "image uploadation to cloudinary failed",
              errorDetail: err,
            });
        }
      });
    }
    const newPost = new Post(postContent)
    const savedPost = await newPost.save()
    const addUserPost = await User.findById(userId)
    addUserPost.posts = addUserPost.posts.concat(savedPost._id)
    await addUserPost.save()
    return res.status(201).json({success:"true",savedPost})
  } catch (error) {
    console.log(error);
  }
});

//like post
router
  .route("/:clientId/likePost/:postId")
  .post(async (req, res) => {
    try {
      const { clientId, postId } = req.params;
      const getPost = await Post.findById(postId);
      const checkAlreadyLiked = getPost.like.includes(clientId)
      const checkAlreadyDisliked = getPost.dislike.includes(clientId)
      if(checkAlreadyLiked){
        return res.json({ success: false, message:"already liked by user" });
      }
      getPost.like = getPost.like.concat(clientId)
      if(checkAlreadyDisliked)
      getPost.dislike = getPost.dislike.filter((client) => client!=clientId )
      await getPost.save();
      return res.json({ success: true, getPost });
    } catch (error) {
      console.log(error);
    }
  });

//undo like
router
  .route("/client/:clientId/undolike/:postId")
  .post(async (req, res) => {
    try {
      const { clientId, postId } = req.params;
      const getPost = await Post.findById(postId);
      if(getPost.like.includes(clientId)){
        getPost.like = getPost.like.filter((client) => client != clientId)
        await getPost.save();
      }  
      return res.json({ success: true, getPost });
    } catch (error) {
      console.log(error);
    }
  });

//undo dislike

router
  .route("/client/:clientId/undodislike/:postId")
  .post(async (req, res) => {
    try {
      const {clientId, postId } = req.params;
      const getPost = await Post.findById(postId);
      if (getPost.dislike.includes(clientId))
      {
        getPost.dislike = getPost.dislike.filter((client) => client != clientId)
        await getPost.save();
      }
      return res.json({ success: true, getPost });
    } catch (error) {
      console.log(error);
    }
  });

//dislike post

router
  .route("/client/:clientId/dislikePost/:postId")
  .post(async (req, res) => {
    try {
      const { clientId, postId } = req.params;
      const getPost = await Post.findById(postId);
      const checkAlreadyLiked = getPost.like.includes(clientId)
      const checkAlreadyDisliked = getPost.dislike.includes(clientId)
      if(checkAlreadyDisliked)
        getPost.dislike = getPost.dislike.filter((client) => client!=clientId )
      if(checkAlreadyLiked){
        return res.json({ success: false, message:"already liked by user" });
      }
      getPost.like = getPost.like.concat(clientId)
      
      await getPost.save();
      return res.json({ success: true, getPost });
      // const { clientId, postId } = req.params;
      // console.log(clientId,postId)
      // const getPost = await Post.findById(postId);
      // if(!getPost.dislike.includes(clientId))
      //   getPost.dislike = getPost.dislike.concat(clientId)
      // if(getPost.like.includes(clientId))
      //   getPost.like = getPost.like.filter((client) => client != clientId)  
      // await getPost.save();
      // return res.json({ success: true, getPost });
    } catch (error) {
      console.log(error);
    }
  });

//remove post
router.route("/:userId/removePost/:postId").post(async(req, res) => {
  try {
    const { userId, postId } = req.params;
    console.log(userId,postId)
    const getPost = await Post.findById(postId);
    console.log(getPost)
    if(String(getPost.author) === userId)
      {
        const updateUserPost = await User.findById(userId)
        console.log(updateUserPost.posts,typeof (updateUserPost.posts[0]))
        updateUserPost.posts = updateUserPost.posts.filter((post) => String(post) != postId )
        await updateUserPost.save()
        const getUpdatePost = await Post.findOneAndRemove(postId)
        console.log(getUpdatePost)
        if(getUpdatePost)
        return res.json({ success: true, getUpdatePost})
      }
      return res.json({success:false,message:"Only owner can delete"})
  } catch (error) {
    console.log(error);
  }
});

// edit post
router.route("/:userId/editPost/:postId").post(async (req, res) => {
  try {
    const { userId, postId } = req.params;
    const { postText } = req.body;
    const getUser = await User.findById(userId);
    const getPost = await Post.findById(postId);
    if(String (getPost.author) === userId){
    const getUpdatePost = await Post.findOneAndUpdate({"_id" : postId },{
      $set:{
        postText:postText
      }
    })
    return res.json({ success: true, getUpdatePost});
  }    
    return res.json({ success: true, getPost });
  } catch (error) {
    console.log(error);
  }
});

//add comment

router.route("/comment/:postId/userId/:userId").post(async (req, res) => {
  try {
    const {userId, postId } = req.params;
    const { comment } = req.body;
    const getPost = await Post.findOneAndUpdate(postId)
    let defaultComment = {
      message:comment,
      author:userId
    }
    getPost.comments = getPost.comments.concat(defaultComment)
    await getPost.save()
    return res.status(201).json({success:true,getPost})
  } catch (error) {
    console.log(error);
  }
});

//delete comment //check author of comment
router
  .route("/:userId/post/:postId/comment/:commentId")
  .post(async (req, res) => {
    try {
      const { userId, postId, commentId } = req.params;
      const getUser = await User.findById(userId);
      getUser.posts = getUser.posts.map((eachpost) => {
        if (String(eachpost._id) === String(postId)) {
          eachpost.comments = eachpost.comments.filter(
            (comment) => String(comment._id) !== String(commentId)
          );
          return eachpost;
        }
        return eachpost;
      });
      await getUser.save();
      return res.json({ success: true, getUser });
    } catch (error) {
      console.log(error);
    }
  });

module.exports = router;
