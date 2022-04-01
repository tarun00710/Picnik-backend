const bcrypt = require('bcryptjs/dist/bcrypt')
const express =  require('express')
const router = express.Router()
const {User} = require('../Model/userModel')


//create user

router.route('/registration').post(async(req,res) => {
    const {name,username,email,password,bio} = req.body
    try {
        const createUser = new User({
            name : name,
            username:username,
            email: email,
            password : password,
            bio : bio
        })
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