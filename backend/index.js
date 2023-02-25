import express from 'express'
import mongoose from 'mongoose';
import cors from 'cors'
import userRoute from './routes/users.js'
import authRoute from './routes/auth.js'
import postRoute from "./routes/post.js"
import conversationRoute from "./routes/conversations.js"
import messageRoute from "./routes/messages.js"
import multer from 'multer'
import dotenv from 'dotenv';
import path from 'path'
//socket io
import { fileURLToPath } from 'url';
import { Server } from "socket.io";


const app= express();
const __filename= fileURLToPath(import.meta.url);// social-app\backend\index.js
const __dirname = path.dirname(__filename);// social-app\backend
dotenv.config({ path: path.resolve(__dirname, './.env') });
//midleware
app.use(express.json());
app.use(cors())
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/images");
      },
      filename: function (req, file, cb) {
        cb(null, req.body.name);
      }
    })
const upload=multer({storage});
app.post("/upload", upload.single('file'), (req,res)=>{
    try{
    res.status(200).json("file upload successfuly")
    }catch(err){
        console.log(err);
    }
})

//Routes
app.use("/users", userRoute);
app.use("/auth", authRoute);
app.use("/posts", postRoute);
app.use("/conversations", conversationRoute);
app.use("/messages", messageRoute);
app.use("/images", express.static(path.join(__dirname, "public/images")));

//------------------------------Deployment--------------------------//
/*const __dirname1=path.dirname(__dirname);
    // get path of images//
    app.use(express.static(path.join(__dirname1, "/client/build")));

    app.get('*',(req,res)=>{
        res.sendFile(path.resolve(__dirname1, "client", "build", "index.html"));
    });*/
//------------------------------Deployment--------------------------//

// listen to server
const PORT= process.env.PORT || 3000

const httpServer= app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT} !`)
})
const io = new Server(httpServer, {
    cors:{
        origin:["http://localhost:3000", "https://social-app-test.onrender.com"],
    }
});

// connection to mongoDB
mongoose.set('strictQuery', true);

mongoose.connect(process.env.MONGODB_URL,()=>{
    console.log("connected to database")
})


// socket.io

let users=[];
const AddUser = (userId, socketId) => {
    const userExists = users.some(user => user.userId === userId)
    if (userExists) {
        users = users.filter(user => user.userId !== userId)
        users.push({ userId, socketId })
    } else users.push({ userId, socketId })

}
const removeUser=(socketId)=>{
    users= users.filter((user)=>user.socketId !== socketId);
}
const getUser=(userId)=>{
    return users.find((user)=>user.userId === userId);
}

//when connect
io.on("connection", (socket) => {
    console.log("a user connected");
    //send to all clients io.emit("welcome", "hello from socket server");
    //after connection take userId and socketId from clients
    socket.on("addUser", (userId)=>{
        AddUser(userId, socket.id);
        //sent users with userId and socketId to clients
        io.emit("getUsers", users);
    })

    // send and get message 
    socket.on("sendMessage",({senderId, receiverId, text})=>{
        const user= getUser(receiverId);
        io.to(user?.socketId).emit("getMessage",{
            senderId,text
        })
    });
    //when disconnect
    socket.on("disconnect", ()=>{
        console.log("user disconnected");
        removeUser(socket.id);
        io.emit("getUsers", users);

    })
});
