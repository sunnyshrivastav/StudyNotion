const mongoose = require('mongoose');
const  courseSchema = new mongoose.Schema({
    
   courseName:{
    type:String,
   },
    courseDescription:{
     type:String,
    },
    instructor:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"user",
    },
    whatYouWillLearn:{
        type:String,
        required:true
    },
    courseContent:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Section",
        }
    ],
    ratingAndReview:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"RatingAndReview",
        }
    ],
    price:{
        type:Number,
        
    },

thumbnail:{
    type:String,

},
tag:{
    type: [String],
    required: true,
},
category:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Category",
},
StudentsEnrolled:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"user",
}],

instructions: {
    type: [String],
},
status: {
    type: String,
    enum: ["Draft", "Published"],
},


})
module.exports = mongoose.model('Course', courseSchema); 