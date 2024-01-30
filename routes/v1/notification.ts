import express, { NextFunction, Request, Response } from "express";
import { authorizeRoles, isAuthenticated } from "../../middleware/auth";
import { createOrder } from "../../controllers/orderController";
import { getNotification, updateNotification } from "../../controllers/notificationController";


// Creating a new router instance
const router = express.Router();


router.get("/get-all-notifications", isAuthenticated, authorizeRoles("admin"),getNotification);
router.put("/update-notification/:id", isAuthenticated, 
authorizeRoles("admin"), updateNotification);




module.exports = router;
