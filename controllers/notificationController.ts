import { NextFunction, Request, Response } from "express";
import { catchAsyncError } from "../middleware/catchAsyncError";
import { ErrorHandler } from "../utils/ErrorHandler";
import Notification from "../models/notification";

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