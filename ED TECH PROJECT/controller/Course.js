const Course = require ("../models/Course");
const Category = require("../models/Cataegory");
const User = require("../models/User");
const {uploadImageToCloudinary} = require("../utils/imageUploder");

//createCourse handler function
exports.createCourse = async(req,res)=>{
    try{
        // Get user ID from request object
	
        const userId = req.user.id;
         //fetch data
         let {courseName , courseDescription,whatYouWillLearn,price,tag,category,status,
			instructions} = req.body;

         //get thumbnail
         const thumbnail = req.files.thumbnailImage;

         //validation
         if(!courseName || !courseDescription||!whatYouWillLearn||!price||!tag||!thumbnail||!category ){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            })
         }
         if (!status || status === undefined) {
			status = "Draft";
		}
         //check for instructor
         
         const instructorDetails = await User.findById(userId,{
            accountType: "Instructor",
         }); 
         console.log("Instructor Details:",instructorDetails);
         //TODO: verify the userid and instructor_id are same or not

         if(!instructorDetails){
            return res.status(404).json({
                success:false,
                message:"Instrutor Details not found",
            })
         }
         //check given tag is valid or not
        //   const tagDetails =  await Tag.findById(tag);
        //   if(!tagDetails){
        //     return res.status(404).json({
        //         success:false,
        //         message:"Tag Details not found",
        //     })
        //   }
        const categoryDetails =  await Category.findById(category);
          if(!categoryDetails){
            return res.status(404).json({
                success:false,
                message:"category Details not found",
            })
          }
          //upload Image Top cloudinary
          const thumbnailImage = await uploadImageToCloudinary(thumbnail,process.env.FOLDER_NAME);
          //create an entry for new course
          const newCourse =  await Course.create({
            courseName,
            courseDescription,
            instructor:instructorDetails._id,
            whatYouWillLearn:whatYouWillLearn,
            price,
            tag:tag,
            category: categoryDetails._id,
            thumbnail:thumbnail.secure_url,
            status: status,
			instructions: instructions,
          })

          //add the new course to the user schema of instructor
          await User.findByIdAndUpdate(
            {_id:instructorDetails._id},
            {
                // course k array k andr new course ki id store hori h

                $push: {
                    courses:newCourse._id,
                }
            },
            {new:true},


          );
          //update the Tag ka schema
          // Add the new course to the Categories
		await Category.findByIdAndUpdate(
			{ _id: category },
			{
				$push: {
					course: newCourse._id,
				},
			},
			{ new: true }
		);
          //TODO: HW


         return res.status(300).json({
            success:true,
            message:"Course created successfully",
            data:newCourse,
         })


    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:'Failed to create course',
            error:err.message,
        })
    }
}
//getAllCourses handler function
exports.getAllCourses = async (req,res)=>{
    try{
        const allCourses = await Course.find({}, {courseName:true,
                                                price:true,
                                                thumbnail:true,
                                                instructor:true,
                                                ratingAndReview:true,
                                                StudentsEnrolled:true, } )
                                                .populate("instructor")
                                                .exec(); 
                        return res.status(200).json({
                            success:true,
                            message:'Data for all courses fetched successfully',
                            data:allCourses,
                        })
    }catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:'cannot fetch course data',
            error:err.message,
        })
    }
}

//get courses details
exports.getCourseDetails = async (req,res) =>{
	try{
		//get id
		const {courseId} = req.body;
		//find course details'
		const courseDetails = await Course.find(
											{_id:courseId})
											.populate(
												{
													path:"instructor",
													populate:{
														path:"additionalDetails",
													}

												}
											)
											.populate("category")
											// .populate("RatingAndReview")
											.populate({
												path:"courseContent",
                                                populate:{
                                                    path:"subSection",
                                                }
											})
                                            .exec();
		//validation
        if(!courseDetails){
            return res.status(400).json({
                success:false,
                message:`COULD NOT FIND THE COURSE WITH ${courseId}`,
            })
        }										
            // return response
            return res.status(200).json({
                success:true,
                message:"COuld details fetched successfully",
                data:courseDetails,
            })
											
	}catch(err){
        console.log(err);
        return res.status(200).json({
            success:false,
            message:err.message,
        })

	}
}