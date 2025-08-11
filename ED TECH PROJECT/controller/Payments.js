const {instance} = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/Course");
const mailSender = require("../utils/mailSender");
const {courseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail");
const { default: mongoose } = require("mongoose");

//capture the payment and iniate the razorpay order
exports.capturePayment = async (req,res) =>{
    try{
        //get course id and userid
        const {course_id} = req.body;
        const userId = req.user.id;
        //validation
        //valid xourse id 
        if(!course_id){
            return res.json({
                success:false,
                message:"Please provide valid course id"
            })
        }
        //valid coursedetails
        let course;
        try{
            course = await Course.findById(course_id);
            if(!course){
                return res.json({

                    success:false,
                    message:"Could not find the course",
                });
            }
            //user already pay for the same course
            const uid = new mongoose.Types.ObjectId(userId);
            if(course.StudentsEnrolled.includes(uid)){
                return res.status(200).json({
                    success:false,
                    message:'student is already enrolled',

                });
            }
        }catch(err){
            console.log(err);
            return res.status(500).json({
                success:false,
                message:err.message,
            })
        }
        
        //crate order
        const amount  = course.price;
        const currency = "INR";
        const options = {
            amount : amount*100,
            currency,
            receipt:Math.random(Date.now()).toString(),
            notes:{
                courseId:course_id,
                userId
                       }

        };
        try{
            //initiate the payment using razorpay
            const paymentResponse = await instance.orders.create(options);
            console.log(paymentResponse);
            return res.status(200).json({
                success:true,
                courseName:course.courseName,
                courseDescription:course.courseDescription,
                thumbnail:course.thumbnail,
                orderId : paymentResponse.id,
                currency:paymentResponse.currency,
                amount:paymentResponse.amount,
            })

        }catch(err){
            console.log(err);
            return res.json({
                success:false,
                message:"could not initiate order",
            })
        }

        
    }catch(err){
        console.log(err);
        return res.json({
            success:false,
            message:err.message,
        })
    }
}

//verify signature of razorpay and server
exports.verifySignature = async (req,res)=>{
    const webhoojSecret  = "12345678";

    const signature = req.headers("x-razorpay-signature");
    const shaSum = crypto.createHmac("sha256",webhoojSecret);
    shaSum.update(JSON.stringify(req.body));
    const digest  = shaSum.digest("hex");

    if(signature===digest){
        console.log("payment is authorized ");
        const {courseId,userId} = req.body.payload.payment.entity.notes;
        try{
            //fulfill the action

            //find the course and enroll the student in it
            const enrolledCourse = await Course.findOneAndUpdate(
                                                {_id:courseId},
                                                {$push:{StudentsEnrolled:userId}},
                                                {new:true},

            );
            if(!enrolledCourse){
                return res.status(500).json({
                    success:false,
                    message:'course not found',
                });
            }
            console.log(enrolledCourse);
             //find the student and add the course to their list enrolled courses me
             const enrolledStudent = await User.findOneAndUpdate(
                                                {_id:userId},
                                                {$push:{courses:courseId}},
                                                {new:true},      
             );
             console.log(enrolledStudent);
             //mail send krdo confirmatiion wala
             const emailResponse = await mailSender(
                                        enrolledStudent.email,
                                        "congratulations,you are onboarded into new codehelp course",

             );
             console.log(emailResponse);
             return res.status(200).json({
                success:true,
                message:"signature verified and courses added"
             });
        }catch(err){
            console.log(err);
            return res.status(500).json({
                success:false,
                message:err.message,
            })

        }
    }   

    else{
        return res.status(400).json({
            success:false,
            message:"Invalid  request",
        })
    }
}

