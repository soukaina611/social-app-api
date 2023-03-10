import express from 'express'
import User from '../models/User.js'
import bcrypt from 'bcrypt'

const router= express.Router();

// update user
router.put("/:id",async(req,res)=>{
    if(req.body.userId=== req.params.id || req.user.isAdmin){
        if(req.body.password){
            try{
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt);
            }catch(err){
                res.status(500).json(err)
            }
        }
        try{
            const user= await User.findByIdAndUpdate(req.params.id, {
                $set : req.body
            });
            res.status(200).json("User uptaded !")
            }catch(err){
                res.status(500).json(err)
            }
    }else{
        res.status(403).json("you can update only your account !")
    }
   
    
})
// delete user
router.delete("/:id", async(req, res)=>{
    if(req.body.userId=== req.params.id || req.user.isAdmin){
        try{
            const user= await User.findByIdAndDelete(req.params.id);
            res.status(200).json("user deleted !")
            
        }catch(err){
            res.status(500).json(err)
        }
    }else{
        res.status(403).json("you can delete only your account")
    }

    }
)

// get a user
router.get("/", async(req,res)=>{
    const userId= req.query.userId;
    const username= req.query.username;
    try{
        const user=  userId ? await User.findById(userId): await User.findOne({username: username})
        // not show password or updatedAt
        const {password,updatedAt, ...other}=user._doc
        res.status(200).json(other)
    }catch(err){
        res.status(500).json(err)
    }
})
// get all users
router.get("/all", async(req,res)=>{
    try{
        const users = await User.find();
        res.status(200).json(users);
    }catch(err){
        res.status(500).json(err)
    }
})
// get friends user
router.get("/friends/:userId", async(req, res)=>{
    
        const user= await User.findById(req.params.userId);
    if(user?.followings){
        try{
        const friends = await Promise.all(
            user?.followings.map((friendId)=>{
                return User.findById(friendId);
            })
        );
        let friendList=[];
        friends?.map((friend)=>{
            const{_id, username, profilePicture}=friend;
            friendList.push({_id, username, profilePicture})
        })
        res.status(200).json(friendList);
        
        }catch(err){
        console.log(err);
        }
    }
})
// follow user
router.put("/:id/follow", async(req,res)=>{
    if(req.body.userId !== req.params.id || req.userId.isAdmin){
        try{
            const user= await User.findById(req.params.id);
            const currentUser= await User.findById(req.body.userId);
            if(!user.followers.includes(req.body.userId)){
            await user.updateOne({$push:{followers : req.body.userId }})
            await currentUser.update({$push:{followings : req.params.id}})

            res.status(200).json("user followed successfuly");
            }
            else{
                res.status(403).json("You already follow this user");
            }
        }catch(err){
            res.status(500).json(err);
        }
    }else{
        res.status(403).json("you can't follow yourself !");
    }
 })
//unfollow user
router.put("/:id/unfollow", async(req,res)=>{
    if(req.body.userId !== req.params.id ){
        try{
            const user = await User.findById(req.params.id);
            console.log(user);
            const currentUser= await User.findById(req.body.userId);
            if(user.followers.includes(req.body.userId)){
                await user.updateOne({$pull:{followers : req.body.userId}})
                await currentUser.updateOne({$pull : {followings : req.params.id}})
                res.status(200).json("user has been unfollowed ")
            }else{
            res.status(404).json("You don't folllow this user");
            }
        }catch(err){
            res.status(500).json(err)
        }
    }else{
        res.status(403).json("You can't unfollow yourself")
    }
})


export default router;