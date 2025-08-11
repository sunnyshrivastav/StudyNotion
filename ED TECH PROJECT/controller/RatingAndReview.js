const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const { default: mongoose } = require("mongoose");


//create Rating
exports.createRating = async(req,res) =>{
    try{
        //get user id
         const userId = req.user.id;
        //fecth data from req ki body
        const {rating , review,courseId} = req.body;
        //checked if user enrolled or not
        const courseDetails = await Course.findOne(
                                    {_id:courseId,
                                    studentEnrolled:{$elemMatch:{$eq:userId},}
                                 });
        
        if(!courseDetails){
            return res.status(404).json({
                success:false,
                message:"student is not enrolled in the course"

            })
        }
        //check if user already reviwed the course
        const alreadyReviewed  = await RatingAndReview.findOne({
                                      user:userId,
                                      course:courseId,  
                                    })
        
        if(alreadyReviewed){
            return res.status(403).json({
                success:false,
                message:"course is already reviewed by the user",
            });
        }
        //rating and  review create
        const ratingReview = await RatingAndReview.create({
                                    rating, review,
                                    course:courseId,
                                    user:userId,
        })
        //update the course with rating and review
        const updatedCourseDetails = await Course.findByIdAndUpdate({_id:courseId},
                                    {
                                        $PUSH:{
                                            ratingAndReview:ratingReview._id,
                                        }
                                    } ,
                                    {new:true}
                                );
                                console.log(updatedCourseDetails);
            return res.status(200).json({
                success:true,
                message:"Rating and review created successfully",
                ratingReview,
            })


    }catch(err){
        console.log(err);
        return res.status(200).json({
            success:false,
            message:err.message

    
        })
       
    }
}

//getAverageRating

exports.getAverageRating = async(req,res)=>{
    try{
        //get course id
        const courseId=req.body.courseid;
        //calculate avg rating
        const result  = await RatingAndReview.aggregate([
            {
                $match:{
                    course:new mongoose.Types.ObjectId(courseId)
              },

            },
            {
                $group:{
                    _id:null,
                    averageRating:{$avg:"$rating"},

                }
            }
        ])
        //return rating
        if(result.length>0){
            return res.status(200).json({
                success:true,
                averageRating:result[0].averageRating,

                
            })
        }
        //if no rating/review exist
        return res.status(200).json({
            success:true,
            message:"average rating is 0, no ratings given till now ",
            averageRating:0,
        })
        //return avg rating
    

    }catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:err.message,
        })
    }
}

//getAllRating rewviws
exports.getAllRating = async (req,res)=>{
    try{
        const allReviews = await RatingAndReview.find({})
                                    .sort({rating:"desc"})
                                    .populate({
                                        path:"user",
                                        select:"firstName lastName email image",
                                    })
                                    .populate({
                                        path:"course",
                                        select:"courseName",
                                    })
                                    .exec();
              return res.status(200).json({
                success:true,
                message:"All review fetched successfully",
                data:allReviews,
              });                      
    }catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:err.message,
        })

    }
}