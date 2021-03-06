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
      console.log(checkAlreadyDisliked,checkAlreadyLiked)
      if(checkAlreadyLiked){
        getPost.like = getPost.like.filter((client) => client != clientId)
      }else
      getPost.like = getPost.like.concat(clientId)
      if(checkAlreadyDisliked)
      getPost.dislike = getPost.dislike.filter((client) => client!=clientId )
      await getPost.save();
      return res.json({ success: true, getPost });
    } catch (error) {
      console.log(error);
    }
  });

  //dislike post
router
  .route("/:clientId/dislikePost/:postId")
  .post(async (req, res) => {
    try {
      const { clientId, postId } = req.params;
      const getPost = await Post.findById(postId);
      const checkAlreadyLiked = getPost.like.includes(clientId)
      const checkAlreadyDisliked = getPost.dislike.includes(clientId)
      if(checkAlreadyDisliked)
        getPost.dislike = getPost.dislike.filter((client) => client!=clientId )
        else
        getPost.dislike = getPost.dislike.concat(clientId)  
      if(checkAlreadyLiked){
        getPost.like = getPost.like.filter((client) => client != clientId)
      }
      await getPost.save();
      return res.json({ success: true, getPost });
    } catch (error) {
      console.log(error);
    }
  });

//remove post
router.route("/:userId/removePost/:postId").post(async(req, res) => {
  try {
    const { userId, postId } = req.params;
    console.log(postId)
    const getPost = await Post.findById(postId);
    console.log(getPost)
    // if(String(getPost.author) === userId)
    //   {
        const updateUserPost = await User.findById(userId)
        // console.log(updateUserPost.posts,typeof (updateUserPost.posts[0]))
        updateUserPost.posts = updateUserPost.posts.filter((post) => String(post) !== String(postId ))
        await updateUserPost.save()
        const deletedPost = await Post.findOneAndDelete(postId)
        const getUpdatePost = await Post.find({})
        return res.json({success:true,getUpdatePost})
        if(getUpdatePost)
        return res.json({ success: true, getUpdatePost})
      // }
      // return res.json({success:false,message:"Only owner can delete"})
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
  //unfollow

  router.route("/:userId/unfollow/:clientId").post(async(req,res)=>{
    try {
      const {userId,clientId} = req.params;
      const getUser = await User.findById(userId)
      getUser.followings = getUser.followings.filter((userid) => String(userid )!== String(clientId))
      await getUser.save()
      const getUpdatedUser = await User.findById(userId).populate("followings")
      return res.json({success:true,getUpdatedUser})
    } catch (error) {
      console.log(error)
    }
  })

  //remove follower
  router.route("/:userId/removefollower/:clientId").post(async(req,res)=> {
    try {
      const {userId,clientId} = req.params;
      const getUser = await User.findById(userId)
      getUser.followers = getUser.followers.filter((userid) => String(userid )!== String(clientId))
      await getUser.save()
      const getUpdatedUser = await User.findById(userId).populate("followers")
      return res.json({success:true,getUpdatedUser})
    } catch (error) {
      console.log(error)
    }
  })
  //get posts comment
   router.route('/:postId/comments').get(async(req,res)=>{
    try {
      const {postId} = req.params
      const getPost = await Post.findById(postId).populate({
        path:"comments",
        populate:{
          path:"author"
        }
      })
      return res.json({success:true,getPost})
    } catch (error) {
      console.log(error.message)
    }
   })


//getuserfollowing post
 router.route('/:userId/feedposts').get(async(req,res) => {
   try {
    const { userId } = req.params
     const getuserfollowing = await User.findById(userId).populate({
      path:"followings",
      populate:{
        path:"posts",
          populate:{
            path:"author"
          
        }
      }
     })
     let allpost = []
     const getAllPosts = getuserfollowing.followings?.map((following) => {
      // console.log(following.posts)
      allpost = [...allpost,...following.posts] //rest operator
      console.log(following.posts)
      return following
    })
    //   console.log(getAllPosts)
      // return person.post?.map((post) => {
      //   allpost = [...allpost,post]
      //   return post
      // })
    //  })
    //  res.send(getAllPosts)
     res.json({success:true,allpost})
   } catch (error) {
      console.log(error)
   }
 })

router.route('/:suggestions').get(async(req,res)=>{
  try {
    const {suggestions} = req.params
    let response = await User.find({
      "$or": [
        { username : {$regex  : suggestions}}
      ]
    })
    if(response){
      res.status(201).json({success:true,response})
    }
  } catch (error) {
    console.log(error.message)
  }
})






module.exports = router;
