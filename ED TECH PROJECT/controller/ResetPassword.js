const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt =require("bcrypt");
const crypto = require("crypto");
//reset Password Token
exports.resetPasswordToken = async(req,res)=>{
try{
        //get email from req body
        const email = req.body.email;

        //check user for this email,emailverifiacation
        const user = await User.findOne({email:email});
        if(!user){
            return res.json({
                success:false,
                message:"your email is not registered with us"
            });
        }
    
        //generate token
        const token = crypto.randomUUID();
        console.log(token)
        //update user by adding token and expiration time
        const updatedDetails = await User.findOneAndUpdate({email:email},
                                {
                                    token:token,
                                    resetPasswordExpires:Date.now() + 5*60*1000,
                                },
                                {new:true});//update the document
        
        
        //create url
        //link generation
        const url = `http://localhost:3000/update-password/${token}`
        console.log(url);
        //send mail containning the url
        await mailSender (email,"Password Reset Link",`Password Reset link ${url}`)
        //return response
        return res.json({
            success:true,
            message:"email sent successfully,please check email and change pwd",

        });

}
        catch(err){
            console.log(err);
            return res.status(500).json({
                success:false,
                message:"something went wrong while reseting password"
            })
            
}

}

//reset password
exports.resetPassword = async(req,res)=>{
    try
    {
        //data fetch
    const {password,confirmPassword,token} = req.body;

    //validation
    if(password!==confirmPassword){
        return res.json({
            success:false,
            message:'password not matching',
        })
    }
    //get userdetails from db using token
    const userDetails = await User.findOne({token:token});
    //if no entry - invalid token
    if(!userDetails){
        return res.json({
            success:false,
            message:"token is invalid",
        });
    }
    //token time check
    if(userDetails.resetPasswordExpires<Date.now()){
        return res.json({
            success:false,
            message:"token is expired , please regenerate your token",

        });
    }
    //hash password
    const hashedPassword = await bcrypt.hash(password,10);

    //update password
    await User.findOneAndUpdate(
        {token:token},
        {password:hashedPassword},
        {new:true},
    )
    //response return
    return res.status(200).json({
        success:true,
        message:"password reset successfully",
    });
 }
 catch(err){
    console.log(err);
    return res.status(500).json({
        success:false,
        message:"SOMETHING WENT WRONG WHILE RESETING PASSWORD"
    })
 }
}