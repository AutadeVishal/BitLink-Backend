const mongoose=require('mongoose');
const isvalidemail=require('validator').isEmail;
const isvalidpassword=require('validator').isStrongPassword;
const jwt=require('jsonwebtoken')
const bcrypt=require('bcrypt');
const userSchema=new mongoose.Schema({
    firstName:{type:String,required:true,index:true,maxlength:50,minLength:2},
    lastName:{type:String,required:true,maxlength:50,minLength:2},
    email:{type:String,required:true,unique:true,lowercase:true,trim:true,validate(value){
        //unique:true automatically does index:true
        if(!isvalidemail(value)){
            throw new Error("Type Correct Email");
        }
    }},
    password:{type:String,required:true,minLength:8,validate(value){
        if(!isvalidpassword(value)){
            throw new Error('Password Not Strong Enough');
        }
    }},
    age:{type:Number,required:true,min:18,},
    gender:{type:String,required:true,
        enum:{
            values:["male","female","others"],
            message:`{VALUE} is Not a Valid Gender Type`
        }
      /*  
      ,validate(value){
        if(!["male","female","others"].includes(value)){
            throw new Error("Gender Data Not Valid");
        }

    }
*/},
    about:{type:String,default:"Description Not Available",maxlength:300},
   skills:{type:[String]}
},
{
    timestamps:true
}

);
userSchema.methods.getJWT=async function (){
   // const token=await jwt.sign({password:this.password},"1234");
   const token = await jwt.sign({_id:this._id}, "1234", { expiresIn: "1h" });
    return token;
};
userSchema.methods.validatePassword = async function (password) {
    const isPasswordValid = await bcrypt.compare(password, this.password);
    return isPasswordValid; // Return the result
  };
module.exports=mongoose.model("User",userSchema);; 