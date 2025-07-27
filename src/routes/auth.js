//Routes Specific to Authorisation Routers
const express=require('express');
const authRouter=express.Router();
const User=require('../models/User.js')
const bcrypt=require('bcrypt')


const  {validateSignUpData } = require('../utils/validation');
authRouter.post('/signup',async (req,res)=>{ 

  try {
   
   await validateSignUpData(req.body); // Validate the input data
   const passwordHash=await bcrypt.hash(req.body.password,10);
   const { firstName, lastName, email, password, age, gender,skills } = req.body;

   const user=await User.findOne({email:req.body.email});
   if(user) {
    throw new Error("User With This Email Id Already Exists:")
   }
    //here key Names are same as the model keys so we can directly pass the req.body to the model instead of key:value pairs
    const newUser = new User({
      firstName,
      lastName, 
      email,
      password:passwordHash, 
      age,
      gender,
      skills
    });
    
   const insertedDocument= await newUser.save();
    console.log(' User created:', insertedDocument);

    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error('Error in /signup:', err.message);
    res.status(500).json({ error: err.message });
  }
});


authRouter.post('/login',async (req,res)=>{
try{
const {email,password}=req.body;
const user=await User.findOne({email});
if(!user){
  throw new Error("User Not Found");
}
const isPasswordValid=await user.validatePassword(password);
if(!isPasswordValid){
  throw new Error("Invalid Password");
}
  //const token=await jwt.sign({_id:user._id},"1234"); This can be ofloaded to user.js
  const token=await user.getJWT();
  res.cookie('token',token);
  console.log("User logged in:",user.email);
  res.json({
    Token:`Token Generated ${token}`,
    Message:`Login Succesfull`
  });
 
  
}
catch(err){
    console.error("Error in /login:",err.message);
    res.send(err.message);
}
});



authRouter.post('/logout',async (req,res)=>{
  res.cookie("token",null,{
    expires:new Date(Date.now()),
  });
  console.log("User Logged Out")
  res.send("Log Out SuccessFully");
})
module.exports=authRouter;


