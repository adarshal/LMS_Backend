import { NextFunction, Request, Response } from "express";
import { catchAsyncError } from "../middleware/catchAsyncError";
import { ErrorHandler } from "../utils/ErrorHandler";
import { v2 as cloudinary } from "cloudinary";
import { createCourse, getAllCoursesService } from "../services/course.service";
import Course, { IComment } from "../models/course";
import { redis } from "../utils/redis";
import mongoose, { ObjectId } from "mongoose";
import path from "path";
import ejs from "ejs";
import sendMail from "../utils/sendMail";
import Notification from "../models/notification";
const User = require("../models/user");

// upload course
export const uploadCourse = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // console.log("inside upload course");
      const data = req.body;
      const thumbnail = data.thumbnail;
      if (thumbnail) {
        const myCloud = await cloudinary.uploader.upload(thumbnail, {
          folder: "courses",
        });
        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }
      createCourse(data, res, next);
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 500));
    }
  }
);

// edit course
export const editCourse = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const thumbnail = data.thumbnail;
      if (thumbnail) {
        // delete old image in cloudinary
        const oldImage = await cloudinary.uploader.destroy(thumbnail.public_id);
        const myCloud = await cloudinary.uploader.upload(thumbnail, {
          folder: "courses",
        });
        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }
      const courseId = req.params.id;
      const course = await Course.findByIdAndUpdate(
        courseId,
        {
          $set: data,
        },
        { new: true }
      );
      return res.status(201).json({
        success: true,
        message: "The course has been updated successfully",
        course,
      });
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 400));
    }
  }
);

//get single course --wo purchasing
export const getSingleCourse = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = req.params.id;
      const isCacheExits = await redis.get(courseId);
      if (isCacheExits) {
        const course = JSON.parse(isCacheExits);
        return res.status(200).json({
          success: true,
          course,
        });
      }
      const course = await Course.findById(req.params.id).select(
        "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.linkAll"
      );
      await redis.set(courseId, JSON.stringify(course), "EX",604800); //7day cache expire
      return res.status(200).json({
        success: true,
        course,
      });
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 500));
    }
  }
);

//get all course --wo purchasing
export const getAllCourses = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isCacheExits = await redis.get("allCourses");
      if (isCacheExits) {
        const courses = JSON.parse(isCacheExits);
        return res.status(200).json({ success: true, courses });
      }
      const courses = await Course.find().select(
        "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.linkAll"
      );
      await redis.set("allCourses", JSON.stringify(courses));
      return res.status(200).json({
        success: true,
        courses,
      });
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 500));
    }
  }
);

// get course content -- only for valid users
export const getCourseByUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      const user=await User.findById(userId).populate('coursesEnrolled');
      if (!user ){
         return next(
        new ErrorHandler("You are not eligible to access this course", 500)
      );
         }
      const userCourseList=user.coursesEnrolled;
      // console.log(user)

      const courseId = req.params.id;
      // console.log(courseId, userCourseList)
      const courseExits = userCourseList?.find(
        (course: any) => course._id.toString() === courseId.toString()
      );
      if (!courseExits) {
        return next(
          new ErrorHandler("You are not eligible to access this course", 500)
        );
      }

      const course = await Course.findById(courseId);
      const content = course?.courseData;
      return res.status(200).json({
        success: true,
        content,
      });
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 500));
    }
  }
);

// add questions in course
interface IAddQuestionData {
  question: string;
  courseId: string;
  contentId: string;
}
export const addQuestionIntoCourse = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    //get the question from body and push it into the question array of that particular course
    try {
      const { question, courseId, contentId }: IAddQuestionData = req.body;
      const course = await Course.findById(courseId);
      if (!mongoose.Types.ObjectId.isValid(contentId)) {
        return next(new ErrorHandler("Invalid content", 400));
      }
      const courseContent = course?.courseData?.find((item: any) => {
        return item._id.equals(contentId);
      });
      if (!course || !courseContent) {
        return next(new ErrorHandler("No such Content found", 404));
      }
      // create new que obj
      const comment = question;
      const newQue: any = {
        user: req.user,
        comment,
        commentReplies: [],
      };
      courseContent.questions.push(newQue);
      await Notification.create({
        title:"New Question added",
        user: req.user?._id,
        message:`You have new que for ${courseContent.title}`             
      });
      await course.save();
      return res.status(201).json({
        success: true,
        course,
      });
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 500));
    }
  }
);

// add question in course content
interface IAddAnswerData {
  answer: string;
  questionId: string;
  courseId: string;
  contentId: string;
}
export const addAnswerToQuestion = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { answer, courseId, contentId, questionId }: IAddAnswerData =
        req.body;
      const course = await Course.findById(courseId);
      if (!mongoose.Types.ObjectId.isValid(contentId)) {
        return next(new ErrorHandler("Invalid content", 400));
      }
      const courseContent = course?.courseData?.find((item: any) => {
        return item._id.equals(contentId);
      });
      if (!course || !courseContent) {
        return next(new ErrorHandler("No such Content found", 404));
      }
      const question = courseContent.questions?.find((item: any) => {
        return item._id.equals(questionId);
      });
      //create new answer object
      const comment = answer;
      const newAns: any = {
        user: req.user,
        comment,
      };
      question?.commentReplies?.push(newAns);
      await course.save();
      if (req.user._id === (question?.user as { _id: string | ObjectId })._id) {
        //5.42.37
        // create a notification
        await Notification.create({
          title:"New Question reply added",
          user: req.user?._id,
          message:`You have new que reply for ${courseContent.title}`             
        });
      } else {
        // send email to the owner of this question
        const data = {
          name: (question?.user as { name: string }).name,
          title: courseContent.title,
        };
        const html = await ejs.renderFile(
          path.join(__dirname, "../mails/questionsReply.ejs"),
          data
        );
        await sendMail({
          email: (question?.user as { email: string }).email,
          subject: "Question reply",
          template: "questionsReply.ejs",
          data,
        });
      }
      res.status(201).json({
        success: true,
        question,
      });
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 500));
    }
  }
);

// add review in course
interface IAddReviewData {
  review: string;
  courseId: string;
  rating: number;
  userId: string;
}

export const addReview = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      const user=await User.findById(userId).populate('coursesEnrolled');
      if (!user ){
         return next(
        new ErrorHandler("You are not eligible to access this course", 500)
      );
         }
      const userCourseList=user.coursesEnrolled;
      const courseId = req.params.id;
      // check if courseId exist in users acc
      const courseExists = userCourseList?.some(
        (course: any) => course._id.toString() === courseId.toString()
      );
      if (!courseExists) {
        return next(
          new ErrorHandler("You are not eligible for reviewing the course", 500)
        );
      }

      const course = await Course.findById(courseId);
      if (!course) {
        return next(new ErrorHandler("No such course exists", 404));
      }
      const { review, rating } = req.body as IAddReviewData;
      const reviewData: any = {
        user: req.user,
        comment: review,
        rating,
      };
      course.reviews.push(reviewData);
      let avg = 0;
      if (course.reviews.length > 0) {
        avg =
          course.reviews.reduce(
            (acc: number, val: { rating: number }) => acc + val.rating,
            0
          ) / course.reviews.length;
      } else {
        avg = 0; // Or handle the case differently as needed
      }
      course.ratings = avg;
      await course.save();
      // create notification
      const notificatiom = {
        title: "New Review Added",
        message: `{req.user?.name} has given a review in ${course.name} `,
      };
      // send notification
      return res.status(200).json({
        success: true,
        course,
      });
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 500));
    }
  }
);

// add reply to review
interface IAddRevieReply {
  comment: string;
  courseId: string;
  reviewId: string;
}
export const addReplyToReview = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { comment, courseId, reviewId } = req.body as IAddRevieReply;
      const course = await Course.findById(courseId);
      if (!course) {
        return next(new ErrorHandler("No such course exists", 404));
      }
      const review = course.reviews?.find(
        (r: any) => r._id.toString() === reviewId
      );
      if (!review) {
        return next(new ErrorHandler("Review not found", 404));
      }

      const replyData: any = {
        user: req.user,
        comment,
      };
      if(!review.commentReplies){
        review.commentReplies=[];
      }
      review.commentReplies.push(replyData);

      await course.save();
      res.status(200).json({
        success: true,
        course,
      });
    } catch (err: any) {
      // console.log("error in adding reply")
      return next(new ErrorHandler(err.message, 500));
    }
  }
);

// get all courses only admins
export const adminGetAllCourses = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllCoursesService(res);
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 400));
    }
  }
);


// delete course only admins
export const deleteCourse =catchAsyncError( async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await Course.findByIdAndDelete(id);
    await redis.del(id);

    res.status(200).json({
      success:true,      
      message: "Course deleted successfully" 
    });
  } catch (err:any) {
    // console.error(err);
    // res.status(500).json({ message: "Something went wrong" });
    return next(new ErrorHandler(err.message, 500));

  }
});