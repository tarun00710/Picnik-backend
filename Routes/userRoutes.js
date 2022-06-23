const bcrypt = require('bcryptjs/dist/bcrypt')
const express =  require('express')
const router = express.Router()
const {User} = require('../Model/userModel')
const cloudinary = require('cloudinary').v2

//create user
router.route('/').get(async(req,res)=>{
    try {
        console.log("hello")
    } catch (error) {
        console.log(error.message)
    }
    
})

router.route('/signup').post(async(req,res) => {
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
        const checkUser = await User.find({email:email})
        const checkPassword = bcrypt.compare(checkUser.password,password)
        if(checkPassword){
            return res.json({success:true,checkUser})
        }
        return res.json({success:false,message:"Authentication failed"})
    } catch (error) {
        console.log(error)
    }
})



//for following

router.route('/:userId/follow/:followId').post(async(req,res) =>{
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

//getting follower following details

router.route('/:uid').get(async(req,res) =>{
    try {
        const {uid} = req.params
        const getDetail = await User.findById(uid).populate("followings followers").select("followings followers -_id")
        if(getDetail){
            res.json({success:true,getDetail})
        }else{
            res.json({success:false,message:"cant retrieve data"})
        }
    } catch (error) {
        console.log(error)
    }
})


module.exports = router