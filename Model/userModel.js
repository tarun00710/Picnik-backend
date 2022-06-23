const bcrypt = require('bcryptjs');
const mongoose =  require('mongoose');
const {Schema,model} = mongoose;


const userSchema = new Schema({
    name:{
        type:String,
        required:true,
    },
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    avatar:{
        type:String
    }
    ,
    password:{
        type:String,
        required:true
    },
    posts:[{type:mongoose.Schema.Types.ObjectId,ref:"Post"}],
    followings:[{
        type:mongoose.Schema.Types.ObjectId,ref:"User"
    }],
    followers:[
        {
            type:mongoose.Schema.Types.ObjectId,ref:"User"
        }
    ],
    bio:{
        type:String,
        required:true
    },
    likedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    

})

userSchema.pre('save',async function(next){
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password,12)
    }
    next()
})


const User = model('User',userSchema)

module.exports = {User}


