const bcrypt = require('bcryptjs');
const mongoose =  require('mongoose');
const {Schema,model} = mongoose;


const commentSchema = new Schema({
    message:{
        type:String
    },
    timeStamp:{
        type:Date
    },
    like:{
        type:Number
    },
    dislike:{
        type:Number
    },
    name:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
}, {
    timestamps:true
})


const postSchema = new Schema({
    postContent:{
        type:String,
        required:true
    },
    like:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    dislike:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    comments:[commentSchema],
    timeStamp:{
        type:Date
    }
})



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
    posts:[postSchema],
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
    

})

userSchema.pre('save',async function(next){
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password,12)
    }
    next()
})


const User = model('User',userSchema)

module.exports = {User}


