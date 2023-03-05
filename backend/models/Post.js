import mongoose from 'mongoose'


const PostSchema= mongoose.Schema({
    userId:{
        type:String,
        required:true
    },
    desc:{
        type:String,
        max:500
    },
    img:{
        type:String
    },
    likes:{
        type:Array,
        default : []
    },
    comments:[
        {
            sender :String,
            text:String
        }
    ]
},
{ timestamps: true }
)

export default mongoose.model('Post', PostSchema);