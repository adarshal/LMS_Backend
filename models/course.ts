import mongoose, { SchemaType, Schema, Model } from "mongoose";

interface IComment extends Document {
  user: object;
  comment: string;
  commentReplies?: IComment[]
}
interface IReview extends Document {
  user: object;
  rating: number;
  comment: string;
  commentReplies: IComment[];
}

interface ILink extends Document{
    title:string;
    url:string;
}
interface ICourseData extends Document{
    title: string;
    description: string;
    videoUrl:string;
    videoThumbanail: object;
    videoSection: string;
    videoLength: number;
    videoPlayer:string;
    linkAll:ILink[];
    suggestion: string;
    questions: IComment[];
}

interface ICourse extends Document{
    name:string;
    description:string;
    price:number;
    estimatedPrice:number;
    thumbnail: object;
    tags:string;
    level: string;
    demoURL:string;
    benifits: {title:string[]};
    prerequisite:{title:string[]};
    reviews:IReview[];
    CourseData:ICourseData[];
    ratings?:number;
    purchased?:number;
}

const revieSchema= new Schema<IReview>({
    user:Object,
    rating:{
        type:Number,
        default:0,
    },
    comment:String,
})
const linkSchema =new Schema<ILink>({
    title:String,
    url:String,
})
const commentSchema=new Schema<IComment>({
    user:Object,
    comment:String,
    commentReplies:[Object],
})

const courseDataSchema= new Schema<ICourseData>({    
    videoUrl:String,
    title:String,
    description:String,
    videoSection: String,
    videoLength: Number,
    videoPlayer:String,
    linkAll:[linkSchema],
    suggestion: String,
    questions: [commentSchema],
})


const CourseSchema = new Schema<ICourse>({
    name:{
        type:String,
        required:true,
    },
    description:{
        type: String,
        required: true,
    },
    price:{
        type:Number,
        required:true,
    },
    estimatedPrice:{
        type:Number,
    },
    thumbnail:{
        public_id:{
            type:String,
            // required:true
        },
        url:{
            type:String,
            required:true
        },
    },
    tags:{
        type: String,
        lowercase: true,  //transform the string to lower case
        trim: true,   //remove any white space before and after
        required:true,
    },
    level:{
        type:String,
        enum:['beginner','intermediate','advanced'],
        default:'beginner'
    },
    demoURL:{
        type:String,
        required:true,
    },
    benifits:[{title:String}],
    prerequisite:[{title:String}],
    reviews:[revieSchema],
    CourseData:[courseDataSchema],
    ratings:{
        type:Number,
        default:0
    },
    purchased:{
       type:Number,
       default:0, 
    },

}
);
const Course = mongoose.model("Course", CourseSchema);
//This is collection, collection contain docs,docs contains fields like name,date. collectn name start capital
// module.exports = Course;
export default Course;
