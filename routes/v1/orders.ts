import express, { NextFunction, Request, Response } from "express";
import { authorizeRoles, isAuthenticated } from "../../middleware/auth";
import { createOrder, getAllOrders } from "../../controllers/orderController";


// Creating a new router instance
const router = express.Router();


router.post("/create-order", isAuthenticated,createOrder);
router.get("/all-orders", isAuthenticated,authorizeRoles("admin"), getAllOrders);




module.exports = router;
