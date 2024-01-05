import express, { NextFunction, Request, Response } from "express";
import {activateUser, signup} from "../../controllers/userController"

const router = express.Router()
console.log('user Router loaded');

//testing route
router.get("/a",(req:Request,res:Response,next:NextFunction)=>{
    
    res.status(200).json({
        success:true,
        message:"user router tested",
    });
    // return res.send("u")
});

router.post("/signup", signup);
router.post("/activate-user", activateUser);

module.exports= router;

