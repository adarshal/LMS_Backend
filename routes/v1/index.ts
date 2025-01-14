import express, { NextFunction, Request, Response } from "express";
const router = express.Router()
console.log('v1 Router loaded');

//testing route
router.get("/test",(req:Request,res:Response,next:NextFunction)=>{
    
    res.status(200).json({
        success:true,
        message:"Api v1 test route tested",
    });
    // return res.send("u")
});

router.use("/user",require("./users"))
router.use("/course",require("./course"))
router.use("/order",require("./course"))
router.use("/notification",require("./notification"))
router.use("/analytics",require("./analytics"))
router.use("/layout",require("./layout"))

module.exports= router;
