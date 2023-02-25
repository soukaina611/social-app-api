import express from "express"
import Message from "../models/Message.js"

const router= express.Router();

//add message
router.post('/', async(req,res)=>{
    try{
        const message= await new Message(req.body);
        const savedMessage= await message.save();
        res.status(200).json(savedMessage)

    }catch(err){
        res.status(500).json(err)
    }
})

//get all messages of conversations
router.get('/:conversationId', async(req,res)=>{
    try{
        const messages= await Message.find({
            conversationId: req.params.conversationId
        })
        res.status(200).json(messages);
    }catch(err){
        res.status(500).json(err)
    }
    
})


export default router;