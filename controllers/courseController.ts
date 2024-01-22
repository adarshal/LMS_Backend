import { NextFunction, Request, Response } from "express";
import { catchAsyncError } from "../middleware/catchAsyncError";
import { ErrorHandler } from "../utils/ErrorHandler";
import { v2 as cloudinary } from "cloudinary";
import { createCourse } from "../services/course.service";
import Course from "../models/course";
import { redis } from "../utils/redis";

// upload course
export const uploadCourse = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
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
      await redis.set(courseId, JSON.stringify(course));
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
