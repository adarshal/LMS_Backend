import { NextFunction, Request, Response } from "express";
import { catchAsyncError } from "../middleware/catchAsyncError";
import { ErrorHandler } from "../utils/ErrorHandler";
import Order, { IOrder } from "../models/order";
import path from "path";
import ejs from "ejs";
import sendMail from "../utils/sendMail";
import Course from "../models/course";
import { newOrder } from "../services/order.service";
import Notification from "../models/notification";
const User = require("../models/user");

// create order
export const createOrder = catchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const {courseId,payment_info}=req.body as IOrder;
        const user= await User.findById(req.user?._id);
        if(!user){
            new ErrorHandler("User not found", 404)
        }

        const courseExists = user.courses?.some(
            (course: any) => course._id.toString() === courseId.toString()
          );
          if (!courseExists) {
            return next(
              new ErrorHandler("You have already purchased the course", 400)
            );
          }
          const course= await Course.findById(courseId);
          if(!course){
           return next(new ErrorHandler("Course not found", 404));
          }
          const data:any={
            courseId:course?._id,
            userId:user?._id,
            payment_info
          }
          
          const mailData={
            order:{
                _id:course?._id.toString().slice(0,6),
                name:course?.name,
                price:course?.price,
                date:new Date().toLocaleDateString(
                    'en-US',
                    { year: 'numeric', month: 'long', day: 'numeric' }
                  )                  
            }
          }
          const html= await ejs.renderFile(path.join(__dirname,"../mails/orderConfirmation.ejs"), {order:mailData});
          try {
            await sendMail({
                email:user.email,
                subject:"Order Confirmation",
                template:"orderConfirmation.ejs",
                data:mailData
            });

          } catch (err:any) {
             return next(new ErrorHandler(err.message, 500));            
          }

          user.courses.push(course._id);
          await user.save();

           await Notification.create({
            title:"New Order",
            user: user._id,
            message:`You have order for ${course.name}`             
          });
          if(!course.purchased){
            course.purchased=1;
          }else{
            course.purchased+=1;
          }
          await course.save()
           newOrder(data,res,next); 
          


    } catch (err: any) {
        return next(new ErrorHandler(err.message, 500));
      }
    }
  );
