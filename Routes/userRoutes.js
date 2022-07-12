const bcrypt = require('bcryptjs')
const express =  require('express')
const router = express.Router()
const {User} = require('../Model/userModel')
const cloudinary = require('cloudinary').v2
const {userCheckHandler} = require('../Middleware/userCheckHandler')
//create user
router.route('/').get(async(req,res)=>{
    try {
        console.log("hello")
    } catch (error) {
        console.log(error.message)
    }
    
})

router.route('/signup').post(userCheckHandler,async(req,res) => {
    const {name,username,email,password,bio} = req.body
    const file = req?.files?.photo
    try {
        let defaultUser = {
            name : name,
            username:username,
            email: email,
            password : password,
            bio : bio
        }
        if(file){
            await cloudinary.uploader.upload(file.tempFilePath , async(error,result) => {
                if(result){
                    console.log(result)
                    defaultUser = {
                        ...defaultUser,avatar:result.secure_url
                    }
                }else{
                    console.log("error uploading photo")
                    res.status(500).json({
                        status: false,
                        message: "image uploadation to cloudinary failed",
                        errorDetail: err,
                      });
                }
            })  
        }
        console.log(defaultUser)
        const createUser = new User(defaultUser)
        const user = await createUser.save()
        if(user){
            res.json({success:true,user})
        }else{
            res.json({success:false,user})
        }
    } catch (error) {
        console.log(error)
    }
})

//login user

router.route('/login').post(async(req,res) => {
    try {
        const {email,password} = req.body
        console.log(email,password)
        const checkUser = await User.findOne({email:email})
        console.log(checkUser)
        const checkPassword = await bcrypt.compare(password,checkUser.password)
        console.log(checkPassword)
        if(checkPassword){
            return res.json({success:true,checkUser})
        }
        return res.json({success:false,message:"Authentication failed"})
    } catch (error) {
        console.log(error)
    }
})
//edit user details

router.route('/edit/:userId').post(async(req,res)=>{
    try {
        console.log("hello2")
        const {userId} =  req.params
        const {name,username,bio} = req.body
        // let getCurrentUser = await User.findById(userId)
        // console.log(getCurrentUser)
        let newavatar = ""
        const file = req?.files?.photo
        if(file){
            await cloudinary.uploader.upload(file.tempFilePath,async(error,result)=>{
                if(result)
                {
                    newavatar=result.secure_url
                }
                else{
                console.log("error uploading photo")
                res.status(500).json({
                    status: false,
                    message: "image uploadation to cloudinary failed",
                    errorDetail: err,
                  });
                }
            })
        }
        let updateUser = await User.findByIdAndUpdate(userId,{
            $set:{
                name:name,
                bio:bio,
                username:username,
                avatar:newavatar
            }
        },{
            new: true
          })
        return res.json({success:true,updateUser})
    } catch (error) {
        console.log(error.message)
    }
})
//for following

router.route('/:userId/follow/:followId').post(async(req,res) => {
    try {
        const {userId,followId} = req.params
        const findActiveUser = await User.findById(userId);
        const SecondUser = await User.findById(followId);
        findActiveUser.followings.push(followId);
        const updateActiveUser = await findActiveUser.save()
        SecondUser.followers.push(userId)
        await SecondUser.save()
        if(updateActiveUser){
             res.json({success:true,updateActiveUser})
        }else{
            res.json({success:false,updateActiveUser})
        }
    
    } catch (error) {
        console.log(error)
    }
})
//getting user posts
router.route('/:uid/posts').get(async(req,res) =>{
    try {
        const {uid} = req.params
        const getDetail = await User.findById(uid).populate("posts").select("posts -_id")
        if(getDetail){
            res.status(201).json({success:true,getDetail})
        }else{
            res.json({success:false,message:"cant retrieve data"})
        }
    } catch (error) {
        console.log(error)
    }
})

//getting follower following details

router.route('/:uid').get(async(req,res) =>{
    try {
        const {uid} = req.params
        const getDetail = await User.findById(uid).populate("followings followers").select("followings followers -_id")
        if(getDetail){
            res.status(201).json({success:true,getDetail})
        }else{
            res.json({success:false,message:"cant retrieve data"})
        }
    } catch (error) {
        console.log(error)
    }
})


module.exports = router