import express, { NextFunction, Request, Response } from "express";
// Importing the necessary controllers and middleware
import { activateUser, signup, signin, logout, updateAccessToken, socialAuth, updateUserInfo, updatePassword, updateProfilePic } from "../../controllers/userController";
import { authorizeRoles, isAuthenticated } from "../../middleware/auth";
import { editCourse, getAllCourses, getSingleCourse, uploadCourse } from "../../controllers/courseController";

// Creating a new router instance
const router = express.Router();

router.post("/create-course", isAuthenticated,authorizeRoles("admin"),uploadCourse);
router.put("/edit-course/:id", isAuthenticated,authorizeRoles("admin"),editCourse);
router.get("/get-course/:id", getSingleCourse);
router.get("/get-courses", getAllCourses);



module.exports = router;
