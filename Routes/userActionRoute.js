const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const { User } = require("../Model/userModel");

router.get("/", async (req, res) => res.send("hello lol"));



//like post
router
  .route("/:userId/client/:clientId/likePost/:postId")
  .post(async (req, res) => {
    try {
      const { userId, clientId, postId } = req.params;
      const getUser = await User.findById(clientId);
      getUser.posts.map((eachpost) => {
        if (String(eachpost._id) === String(postId))
          return eachpost.like.push(userId);
        return eachpost;
      });
      await getUser.save();
      return res.json({ success: true, getUser });
    } catch (error) {
      console.log(error);
    }
  });

//undo like
router
  .route("/:userId/client/:clientId/undolike/:postId")
  .post(async (req, res) => {
    try {
      const {userId,clientId, postId } = req.params;
      const getUser = await User.findById(clientId);
      getUser.posts.map((eachpost) => {
        if(String(eachpost._id) === String(postId))
            {
                eachpost.like = eachpost.like.filter((like)=>String(like)!==String(userId))
            }
            return eachpost
      });
      await getUser.save();
      return res.json({ success: true, getUser });
    } catch (error) {
      console.log(error);
    }
  });

  //undo dislike

  router
  .route("/:userId/client/:clientId/undodislike/:postId")
  .post(async (req, res) => {
    try {
      const {userId,clientId, postId } = req.params;
      const getUser = await User.findById(clientId);
      getUser.posts.map((eachpost) => {
        if(String(eachpost._id) === String(postId))
            {
                eachpost.dislike = eachpost.dislike.filter((dislike)=> String(dislike)!== String(userId))
            }
            return eachpost
      });
      await getUser.save();
      return res.json({ success: true, getUser });
    } catch (error) {
      console.log(error);
    }
  });



//dislike post

router
  .route("/:userId/client/:clientId/dislikePost/:postId")
  .post(async (req, res) => {
    try {
      const { userId, clientId, postId } = req.params;
      const getUser = await User.findById(clientId);
      getUser.posts = getUser.posts.map((eachpost) => {
        if (String(eachpost._id) === String(postId)){
          eachpost.dislike.push(userId);
        }
        return eachpost;
      });
      await getUser.save();
      return res.json({ success: true, getUser });
    } catch (error) {
      console.log(error);
    }
  });

//add post

router.route('/:userId/upload').post(async(req,res) => {
    try {
        const {userId} = req.params
        const {postContent} = req.body
        const getUser = await User.findById(userId)
        getUser.posts.push({postContent})
        await getUser.save()
        res.json({success:true,getUser})
        
    } catch (error) {
        console.log(error)
    }
})

//remove post
router.route("/:userId/removePost/:postId").post(async (req, res) => {
  try {
    const { userId, postId } = req.params;
    const getUser = await User.findById(userId);
    getUser.posts = getUser.posts.filter((eachpost) => {
      return String(eachpost._id) !== String(postId);
    });
    await getUser.save();
    return res.json({ success: true, getUser });
  } catch (error) {
    console.log(error);
  }
});

// edit post
router.route("/:userId/editPost/:postId").post(async (req, res) => {
  try {
    const { userId, postId } = req.params;
    const { postContent } = req.body;
    const getUser = await User.findById(userId);
    getUser.posts = getUser.posts.map((eachpost) => {
      if (String(eachpost._id) === String(postId)){
          eachpost.postContent = postContent
      }
      return eachpost;
    });
    await getUser.save()
    return res.json({success:true,getUser})
  } catch (error) {
    console.log(error);
  }
});

//add comment

router.route("/:userId/addComment/:postId").post(async (req, res) => {
  try {
    const { userId, postId } = req.params;
    const { comment } = req.body;
    const getUser = await User.findById(userId);
    getUser.posts = getUser.posts.map((eachpost) => {
      if (String(eachpost._id) === String(postId))
        eachpost.comments.push({message:comment});
      return eachpost;
    });
    await getUser.save();
    return res.json({ success: true, getUser });
  } catch (error) {
    console.log(error);
  }
});

//delete comment
router.route("/:userId/post/:postId/comment/:commentId").post(async (req, res) => {
    try {
      const { userId, postId , commentId } = req.params;
      const getUser = await User.findById(userId);
      getUser.posts = getUser.posts.map((eachpost) => {
        if (String(eachpost._id) === String(postId)){
            eachpost.comments = eachpost.comments.filter((comment) => String(comment._id) !== String(commentId) )
            return eachpost
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
