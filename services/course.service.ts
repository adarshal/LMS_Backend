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