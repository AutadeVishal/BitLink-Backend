const express = require('express');
const app = express();
const connectDB=require('./config/database');
const cookieParser=require('cookie-parser');

//const validUpdate = require('./utils/validUpdate.js');
//const jwt = require('jsonwebtoken');
//const {validateSignUpData}=require("./middlewares/auth.js");


//routers
const authRouter=require('./routes/auth.js');
const profileRouter=require('./routes/profile.js');
const requestRouter=require('./routes/connectionRequestRouter.js');
const userRouter=require('./routes/userRoute.js');
app.use(express.json());
app.use(cookieParser());//converts the incoming request body to JSON format
connectDB()
.then(()=>app.listen(3000, () => {
    console.log("Server is running on port 3000");
}));


//calling Routers
app.use('/auth',authRouter);
app.use('/profile',profileRouter);
app.use('/connection',requestRouter);
app.use('/request',userRouter);











/*


app.patch('/user/:identifier', async (req, res) => {
  const data = req.body;
  const identifier = req.params?.identifier; // Can be email or user ID
  try {
   validUpdate(data);
    let user;
    const hashedPassword=await bcrypt.hash(data.password,10);
    data.password=hashedPassword;
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      // If identifier is a valid ObjectId, treat it as user ID
      user = await User.findByIdAndUpdate(identifier, data, { new: true, runValidators: true });
    } else {
      // Otherwise, treat it as email
      user = await User.findOneAndUpdate({ email: identifier }, data, { new: true, runValidators: true });
    }

    if (!user) {
       res.status(404).json({ error: "User not found" });
    }
    console.log("Updated user:", user);
    res.send("User Updated Successfully");
  } catch (err) {
    console.log("Error in /user PATCH:", err.message);
    res.status(400).send(err.message);
  }
});



//Get User by Email
app.get('/user',async (req,res)=>{
  const Email=req.body.email;

  try{
   const user= await User.findOne({email:Email});
  if(!user) res.status(404).json({error:"User not found"})
   else{
    res.send(user);
    console.log("User found:",user.email);
    console.log("User data sent successfully")
   }
  }
 catch(err){
    console.error("Error in /user:",err.message);
    res.status(500).json({error:"Internal server error"})
  }

})

//API to Access the Data of User for Feed in UI
app.get('/feed',async (req,res)=>{
  try{
    const users=await User.find({});
    res.send(users);
  }
  catch(err){
    console.error("Error in /feed:",err.message);
    res.status(500).json({error:"Internal server error"})
  };
});

//API for Delete User
app.delete('/delete',async (req,res)=>{
  const userID=req.body._id;
  try{
    const user=await User.findByIdAndDelete(userID);
    //shorthand for user.findOneAndDelete({_id:userID});
    if(!user)res.status(404).json({error:"User not found"});
    else{
      res.status(200).json({message:"User deleted successfully"});
      console.log("User deleted:",user.email);
    }
  }
  catch(err){
    console.error("Error in /delete:",err.message);
    res.status(500).json({error:"Internal server error"})
  }
});
*/
