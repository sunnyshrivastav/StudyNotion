const Section  = require("../models/Section");
const Course  = require("../models/Course");

exports.createSection = async(req,res) =>{
        try{
            //data fecth
            const {sectionName,courseId} = req.body;
            //data validation
            if(!sectionName || !courseId){
                return res.status(400).json({
                    success:false,
                    message:"Missing Properties",
                });
            }
            //create Section
            const newSection = await Section.create({sectionName});

            //update course with section ObjectID
            const updateCourseDetails  = await Course.findByIdAndUpdate(
                                                courseId,
                                                {
                                                    $push:{
                                                        courseContent:newSection._id,
                                                    }
                                                },
                                                {new:true},
                                            )
                                            .populate({
                                                path: "courseContent",
                                                populate: {
                                                    path: "subSection",
                                                },
                                            })
                                            .exec();
            // use populate to replace section/subsections both in the updateCourse Deatials                                    )
            //return response
            return res.status(200).json({
                success:true,
                message:"Section created successfully",
                updateCourseDetails,
            })


        }catch(err){
            return res.status(500).json({
                success:false,
                message:"unable to create section try again later",
                error:err.message
            })

        }
}

exports.updateSection = async (req,res) => {
    try{
        //data input
        const {sectionName,sectionId} = req.body;
        //data validation
        if(!sectionName || !sectionId){
            return res.status(400).json({
                success:false,
                message:"Missing Properties",
            });
        }
        //data update
        const sectionUpdate = await Section.findByIdAndUpdate(sectionId,{sectionName},{new:true});
        //return response
        return res.status(200).json({
            success:true,
            message:"update successfully"
        })
    }catch(err){
        return res.status(500).json({
            success:false,
            message:"unable to update section try again later",
            error:err.message
        })
}
}

exports.deleteSection = async(req,res)=>{
    try{
        //get id - assuming that we are sending id in params
        const {sectionId} = req.params

        //use findByIdAndDelete
        await Section.findByIdAndDelete(sectionId);
        //TODO:do we need to delete the entry from the course schema??
        //return response
        return res.status(200).json({
            success:true,
            message:"Section Deleted successfully"
        })

    }catch(err){
        return res.status(500).json({
            success:false,
            message:"unable to delete section try again later",
            error:err.message
        })

    }
}