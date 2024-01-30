import express, { NextFunction, Request, Response } from "express";
import { authorizeRoles, isAuthenticated } from "../../middleware/auth";
import { createOrder } from "../../controllers/orderController";


// Creating a new router instance
const router = express.Router();


router.post("/create-order", isAuthenticated,createOrder);




module.exports = router;
