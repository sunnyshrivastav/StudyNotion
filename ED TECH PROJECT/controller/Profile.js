const User = require("../models/User");
const Profile =  require("../models/Profile");
const { uploadImageToCloudinary } = require("../utils/imageUploder");
exports.updateProfile = async (req,res) => {
    try{
        //get data
        const { dateOfBirth = " " , about =" ", contactNumber,gender} = req.body
        //get userid
        const id = req.user.id;
        //validation
        if(!contactNumber || !gender ||!id){
            return  res.status(400).json({
                success:false,
                message:"All fields are required",
            });
        }
        //find profile
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        //update profile
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;
        await profileDetails.save();
        //return response
        return  res.status(200).json({
            success:true,
            message:"profile details are updated",
            profileDetails,
        })

    }catch(err){
        return res.status(500).json({
            success:false,
            message:"profile details are not updated",
            error:err.message,
        });
    }
    
}

//delete account 
//explore->how can we schedulw this deletion operation
exports.deleteAccount = async(req,res)=>{
    try{
        // TODO: Find More on Job Schedule
		// const job = schedule.scheduleJob("10 * * * * *", function () {
		// 	console.log("The answer to life, the universe, and everything!");
		// });
		// console.log(job);
        //get id
        console.log("Printing ID: ", req.user.id);
        const id = req.user.id;

        //validation
        const userDetails = await User.findById({ _id: id });
        if(!userDetails){
            return res.status(404).json({
                success:false,
                message:"User not found",
            });
        }
        //delete profile
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});
        //TODO:unenroll user form all enroll courses
        //delete user
        await User.findByIdAndDelete({_id:id});
        //response
        return res.status(200).json({
            success:true,
            message:"User deleted successfully",
        })
    }catch(err){
        return res.status(500).json({
            success:false,
            message:"user cannot be deleted successfully ",
            error:err.message,
        });
    }
}
exports.getAllUserDetails = async(req,res)=>{
    try{
        //get id
        const id = req.user.id;
        //validation and get user details
        const userDetails = await User.findById(id)
                            .populate("additionalDetails")
                            .exec();
                            
                            console.log(userDetails);
        //return response
        return res.status(200).json({
            success:true,
            message:"User Data fetched successfully",
            data:userDetails,
        })


    }catch(err){
        return res.status(500).json({
            success:false,
            message:err.message,
        });
    }
}
exports.updateDisplayPicture = async (req, res) => {
    try {
      const displayPicture = req.files.displayPicture;
      const userId = req.user.id;
      const image = await uploadImageToCloudinary(
        displayPicture,
        process.env.FOLDER_NAME,
        1000,
        1000
      )
      console.log(image)
      const updatedProfile = await User.findByIdAndUpdate(
        { _id: userId },
        { image: image.secure_url },
        { new: true }
      )
       res.send({
        success: true,
        message: 'Image Updated successfully',
        data: updatedProfile,
      })
    } catch (error) {
        console.log(err)
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};
exports.getEnrolledCourses = async (req, res) => {
    try {
      const userId = req.user.id
      const userDetails = await User.findOne({
        _id: userId,
      })
        .populate("courses")
        .exec()
      if (!userDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find user with id: ${userDetails}`,
        })
      }
      return res.status(200).json({
        success: true,
        data: userDetails.courses,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};