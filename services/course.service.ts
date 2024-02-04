import { catchAsyncError } from "../middleware/catchAsyncError";
import { NextFunction, Request, Response } from "express";
import Course from "../models/course";


// create course
export const createCourse=catchAsyncError(
    async (data:any,res:Response)=>{
        const course=await Course.create(data);
        res.status(200).json({
            success:true,
            course
        })
    }
)

export  const getAllCoursesService = async ( res: Response) => {
    try {
      const courses = await Course.find().sort({createdAt:-1} );
      res.status(201).json({
        success: true,
        courses,
      });
    }catch(err:any){
  
    }
  }