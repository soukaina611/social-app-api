import express from "express"
import Post from "../models/Post.js";
import User from "../models/User.js";

const router = express.Router();

//create post
router.post("/", async(req,res)=>{
    try{
        const post = await new Post(req.body)
        const savePost = await post.save();
        res.status(200).json(savePost);
    }catch(err){
        res.status(500).json(err);
    }
})
//update post
router.put("/:id", async(req,res)=>{
    try{
    const post = await Post.findById(req.params.id);
    if(post.userId===req.body.userId){
        await post.updateOne({$set: req.body})
        res.status(200).json("Post has been updated")
    }else{
        res.status(500).json("You can update only your post")
    }
    }catch(err){
        res.status(403).json(err)
    }
})
//delete post
router.delete("/:id", async(req,res)=>{
    try{
    const post = await Post.findById(req.params.id)
        if(post.userId === req.body.userId){
        await post.deleteOne();
        res.status(200).json("Post deleted")
        }else{
            res.status(403).json("you can delete only your post")
        }
    }catch(err){
        res.status(500).json(err)
    } 
})
//like/ dislike post
router.put("/:id/like", async(req,res)=>{
    try{
        const post = await Post.findById(req.params.id);
        if(!post.likes.includes(req.body.userId)){
            await post.updateOne({$push:{likes:req.body.userId}});
            res.status(200).json("post has been liked");
        }else{
            await post.updateOne({$pull : {likes: req.body.userId}})
            res.status(200).json("post has been disliked");
        }
    }catch(err){
        res.status(500).json(err);
    }
})

//get a post
router.get("/:id", async(req,res)=>{
    try{
        const post= await Post.findById(req.params.id);
        res.status(200).json(post);
    }catch(err){
        res.status(500).json(err);
    }
   
})
//get timeline posts
router.get("/timeline/:userId", async(req,res)=>{
    try{
        const currentUser= await User.findById(req.params.userId);
        const userPosts =await Post.find({userId : currentUser._id});
        const friendsPost= await Promise.all(
             currentUser.followings.map((friendId)=>{
                return Post.find({userId:friendId})
             })
        )
        res.status(200).json(userPosts.concat(...friendsPost));

    }catch(err){
        res.status(500).json(err)
    }
})
// get all user posts
router.get("/profile/:username",async(req,res)=>{
    try{
        const user= await User.findOne({username : req.params.username});
        const userPosts= await Post.find({userId:user._id});
        res.status(200).json(userPosts);
    }catch(err){
        res.status(500).json(err)
    }
})

export default router;