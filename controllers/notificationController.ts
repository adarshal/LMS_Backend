import { NextFunction, Request, Response } from "express";
import { catchAsyncError } from "../middleware/catchAsyncError";
import { ErrorHandler } from "../utils/ErrorHandler";
import Notification from "../models/notification";
import cron from "node-cron";

export const getNotification=
catchAsyncError(async (req:Request, res:Response, next:NextFunction) =>{
    try {
        const notifications= await Notification.find().sort({
            createdAt:-1
        })
        res.status(201).json({
            success:true,
            notifications
        })
    } catch (err:any) {
        return next(new ErrorHandler(err.message, 500));;        
    }
})

// update notifications
export const updateNotification=
catchAsyncError(async (req:Request, res:Response, next:NextFunction) =>{
    try {
        const notification= await Notification.findById(req.params.id);
        if(!notification){
            return next(new ErrorHandler("No such notification found",404));
            };
        notification.status? notification.status= "read": notification.status;
        await notification.save();
        const notifications= await Notification.find().sort({
            createdAt:-1
        })
        res.status(200).json({
            success: true,
             notifications
            });

    } catch (err:any) {
        return next(new ErrorHandler(err.message, 500));;        
    }
})

// delete notification -- only admin
cron.schedule("0 0 0 * * *", async()=>{
    console.log('running a job at midnight');
    const thirtyDaysAgo= new Date(Date.now()-30*24*60*60*1000);
    await Notification.deleteMany({createdAt:{$lt:thirtyDaysAgo
        },status:"read"});  
});