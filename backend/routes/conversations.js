import express from 'express'
import Conversation from '../models/Conversation.js'

const router= express.Router();

// new conversation
router.post("/", async(req,res)=>{
    try{
        const conversation = new Conversation({
            members : [req.body.senderId, req.body.receiverId]
        })
        const savedConersation=await conversation.save();
        res.status(200).json(savedConersation)
    }catch(err){
        res.status(500).json(err)
    }
})

// get all user conversation
router.get('/:userId', async(req,res)=>{
    try{
        const conversation= await Conversation.find({
            members :{ $in : [req.params.userId]}
        })
        res.status(200).json(conversation)
    }catch(err){
        res.status(500).json(err)
    }
})

// get conversation includes two users
router.get('/find/:firstUserId/:secondUserId', async(req,res)=>{
    try{
        const conversation= await Conversation.findOne({
            members :{$all : [req.params.firstUserId, req.params.secondUserId]} 
        })
        res.status(200).json(conversation);

    }catch(err){
        res.status(500).json(err)
    }
})
export default router;