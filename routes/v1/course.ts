import express, { NextFunction, Request, Response } from "express";
// Importing the necessary controllers and middleware
import { activateUser, signup, signin, logout, updateAccessToken, socialAuth, updateUserInfo, updatePassword, updateProfilePic } from "../../controllers/userController";
import { authorizeRoles, isAuthenticated } from "../../middleware/auth";
import { addAnswerToQuestion, addQuestionIntoCourse,  addReplyToReview, addReview, adminGetAllCourses, deleteCourse, editCourse, getAllCourses, getCourseByUser, getSingleCourse, uploadCourse } from "../../controllers/courseController";

// Creating a new router instance
const router = express.Router();

router.post("/create-course", isAuthenticated,authorizeRoles("admin"),uploadCourse);
router.put("/edit-course/:id", isAuthenticated,authorizeRoles("admin"),editCourse);
router.get("/get-course/:id", getSingleCourse);
router.get("/get-courses", getAllCourses);
router.get("/get-course-content/:id",isAuthenticated, getCourseByUser);
router.put("/add-question",isAuthenticated, addQuestionIntoCourse);
router.put("/add-answer",isAuthenticated, addAnswerToQuestion);
router.put("/add-review/:id",isAuthenticated, addReview);

//addd reply to review
router.put("/add-reply",isAuthenticated,authorizeRoles("admin"), addReplyToReview);
router.get("/get-all-courses",isAuthenticated,authorizeRoles("admin"), adminGetAllCourses);

router.delete("/delete-course/:id", isAuthenticated,authorizeRoles("admin"), deleteCourse);



module.exports = router;
