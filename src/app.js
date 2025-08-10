const express = require('express');
const app = express();
const connectDB=require('./config/database');
const cookieParser=require('cookie-parser');
const cors=require('cors');
const authRouter=require('./routes/auth.js');
const profileRouter=require('./routes/profile.js');
const requestRouter=require('./routes/connection.js');
const userRouter=require('./routes/userRoute.js');
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
connectDB()
.then(()=>app.listen(3000, () => {
    console.log("Server is running on port 3000");
}));


app.use('/auth',authRouter);
app.use('/profile',profileRouter);
app.use('/connection',requestRouter);
app.use('/request',userRouter);
