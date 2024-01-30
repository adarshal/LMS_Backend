import { catchAsyncError } from "../middleware/catchAsyncError";
import { NextFunction, Request, Response } from "express";
import Order, {IOrder} from "../models/order";


// create new order
export const newOrder=catchAsyncError(
    async (data:any,res:Response ,next:NextFunction)=>{
        const order=await Order.create(data);
        // next(order);
        res.status(201).json({
            success:true,
            order,            
            })
    }
)