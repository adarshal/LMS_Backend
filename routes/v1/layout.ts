import express, { NextFunction, Request, Response } from "express";
import { authorizeRoles, isAuthenticated } from "../../middleware/auth";
import { addLayout, editLayout, getLayoutByType } from "../../controllers/layoutController";

// Creating a new router instance
const router = express.Router();

router.post("/create-layout", isAuthenticated,authorizeRoles("admin"), addLayout );
router.put("/edit-layout", isAuthenticated,authorizeRoles("admin"), editLayout );
router.get("/get-layout",  getLayoutByType );

module.exports = router;
