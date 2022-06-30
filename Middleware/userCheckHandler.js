const { User } = require("../Model/userModel")

const userCheckHandler = async(req,res,next) => {
    try {
        const {email} = req.body;
        const checkuser = await User.findOne({email:email})
        console.log(checkuser)
        if(checkuser)
            return res.json({success:false,message:"user Already registered with this email"})
        next()    
    } catch (error) {
        console.log(error.message)
    }
}
module.exports = {userCheckHandler}