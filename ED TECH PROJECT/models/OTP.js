
const mailSender = require("../utils/mailSender")
const {create} = require("./User");
const emailTemplate = require("../mail/templates/emailVerificationTemplate");

const mongoose = require('mongoose');
const otpSchema = new mongoose.Schema({
email:{
    type:String,
    required:true

},
otp:{
    type:String,
    required:true,
    // unique:true
},

createdAt:{
    type:Date,
    default:Date.now,
    expires: 5*60,// The document will be automatically deleted after 5 minutes of its creation time
},
});

//a function -> to send email
async function sendVerificationEmail(email,otp){
    try{
        const mailResponse = await mailSender(email,"verification Email from StudyNotion",emailTemplate(otp));
        console.log("Email sent successfully",mailResponse);
        
    }
    catch(error){
        console.log("error occured while sending mails:",error.message);
        throw error;  
    }
}
// Define a post-save hook to send email after the document has been saved
otpSchema.pre("save",async function(next){
    console.log("New document saved to database");
    // Only send an email when a new document is created
	if (this.isNew) {
		await sendVerificationEmail(this.email, this.otp);
	}
	next();
})
module.exports = mongoose.model('OTP', otpSchema);


