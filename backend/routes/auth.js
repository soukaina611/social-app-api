import express from 'express'
import User from "../models/User.js"
import bcrypt from 'bcrypt'

const router= express.Router();

//register
router.post("/register", async (req,res)=>{
    try{
        //generating new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword= await bcrypt.hash(req.body.password, salt);
        // create new user
        const user= new User({
            _id:req.body._id,
            username: req.body.username,
            email:req.body.email,
            password:hashedPassword
        })
        // save user and response
        const userSave= await user.save();
        res.status(200).json(userSave);
    }catch(err){
        res.status(400).json(err)
    }
});

// login
router.post("/login", async (req,res)=>{
    try{
        //check email exist
        const user = await User.findOne({email: req.body.email})
        !user && res.status(404).json("user not found")
            // check password
        const validPassword= await bcrypt.compare(req.body.password, user.password)
        !validPassword && res.status(400).json("Password incorrect !")
        res.status(200).json(user)
    }catch(err){
        console.log(err)
    }
});


export default router;