import { NextFunction, Request, Response } from "express";
import { catchAsyncError } from "../middleware/catchAsyncError";
import { ErrorHandler } from "../utils/ErrorHandler";
import { generateLast12MonthData } from "../utils/analyticsGenerator";
import Course from "../models/course";
import Order from "../models/order";
const User = require("../models/user");
import { Model, Document } from "mongoose";

// get user analystics --only admin
export const getUserAnalytics = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await generateLast12MonthData(User);
      res.status(200).json({
        success: true,
        users,
      });
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 500));
    }
  }
);

// get Course analystics --only admin
export const getCourseAnalytics = catchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        // @ts-ignore
        const courses = await generateLast12MonthData(Course);
        res.status(200).json({
          success: true,
          courses,
        });
      } catch (err: any) {
        return next(new ErrorHandler(err.message, 500));
      }
    }
  );

  // get order analystics --only admin
export const getOrderAnalytics = catchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        // @ts-ignore
        const orders = await generateLast12MonthData(Order);
        res.status(200).json({
          success: true,
          orders,
        });
      } catch (err: any) {
        return next(new ErrorHandler(err.message, 500));
      }
    }
  );

  