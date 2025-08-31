require('dotenv').config();
const express = require('express');
const app = express();
const connectDB=require('./src/config/database.js');
const cookieParser=require('cookie-parser');
const cors=require('cors');
const authRouter=require('./src/routes/auth.js');
const profileRouter=require('./src/routes/profile.js');
const requestRouter=require('./src/routes/connection.js');
const userRouter=require('./src/routes/userRoute.js');
const {chatRouter}=require('./src/routes/chat.js')
const initialiseSocket = require('./src/utils/socket.js');
const BASE_URL=process.env.BASE_URL;
const http=require("http");

const server=http.createServer(app);

initialiseSocket(server);


app.use(cors({
  origin:BASE_URL,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
connectDB()
.then(()=>server.listen(3000, () => {
    console.log("Server is running");
}));



app.use('/auth',authRouter);
app.use('/profile',profileRouter);
app.use('/connection',requestRouter);
app.use('/request',userRouter);
app.use('/',chatRouter);

