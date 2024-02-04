import { NextFunction, Request, Response } from "express";
import { catchAsyncError } from "../middleware/catchAsyncError";
import { ErrorHandler } from "../utils/ErrorHandler";
import { generateLast12MonthData } from "../utils/analyticsGenerator";
import Course from "../models/course";
import Order from "../models/order";
const User = require("../models/user");
import { Model, Document } from "mongoose";
import Layout from "../models/layout";
import { v2 as cloudinary } from "cloudinary";

// create layout
export const addLayout = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type } = req.body;
      const typeExits = await Layout.findOne({ type });
      if (!typeExits) {
        return next(new ErrorHandler(`${type} is already exits`, 400));
      }
      if (type === "Banner") {
        const { image, title, subTitle } = req.body;
        const myCloud = await cloudinary.uploader.upload(image, {
          folder: "layout",
        });
        const banner = {
          image: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
          },
          title,
          subTitle,
        };
        req.body = { images: [], title: "", subTitle: "" };
        await Layout.create(banner);
      }
      if (type === "FAQ") {
        const { faq } = req.body;
        // faq.question=faq.question.trim();
        const faqItems = await Promise.all(
          faq.map(async (item: any) => {
            return {
              question: item.question,
              answer: item.answer.trim(),
            };
          })
        );

        await Layout.create({ type: "FAQ", faq: faqItems });
      }
      if (type === "Categories") {
        const { categories } = req.body;
        const categoriesItems = await Promise.all(
          categories.map(async (item: any) => {
            return {
              title: item.title,
            };
          })
        );

        await Layout.create({
          type: "Categories",
          categories: categoriesItems,
        });
      }
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 500));
    }
  }
);


// edit layout
export const editLayout = catchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { type } = req.body;
     
      if (type === "Banner") {
        const bannerData:any=Layout.findOne({type:"Banner"});
       const { image, title, subTitle } = req.body;
       await cloudinary.uploader.destroy(bannerData.image.public_id)
        const myCloud = await cloudinary.uploader.upload(image, {
          folder: "layout",
        });
        const banner = {
          image: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
          },
          title,
          subTitle,
        };
        req.body = { images: [], title: "", subTitle: "" };
        await Layout.findByIdAndUpdate(bannerData._id,{banner});
      }
      if (type === "FAQ") {
        const { faq } = req.body;
        const faqItem=await Layout.findOne({type:"FAQ"})
        // faq.question=faq.question.trim();
        const faqItems = await Promise.all(
          faq.map(async (item: any) => {
            return {
              question: item.question,
              answer: item.answer.trim(),
            };
          })
        );

        await Layout.findByIdAndUpdate(faqItem?._id,{ type: "FAQ", faq: faqItems });
      }
      if (type === "Categories") {
        const { categories } = req.body;
        const categoriesItem=await Layout.findOne({type:"Categories"})

        const categoriesItems = await Promise.all(
          categories.map(async (item: any) => {
            return {
              title: item.title,
            };
          })
        );

        await Layout.findByIdAndUpdate(categoriesItem?._id,{
          type: "Categories",
          categories: categoriesItems,
        });
      }
      res.status(200).json({
        success: true,
        message:"Layout Modified succesfully"
      })
    } catch (err: any) {
        return next(new ErrorHandler(err.message, 500));
      }
    }
  );


  // get layout by type
  export const getLayoutByType = catchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const {type}=req.body;
        const layout=Layout.findOne({type});
        res.status(200).json({
            success: true,
            layout
          })


    } catch (err: any) {
        return next(new ErrorHandler(err.message, 500));
      }
    });