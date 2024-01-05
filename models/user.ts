import mongoose, { SchemaType, Schema } from "mongoose";
import bcrypt from "bcryptjs"


// Define the enum for roles
const RoleEnum = Object.freeze({
    STUDENT: 'student',
    INSTRUCTOR: 'instructor',
    ADMIN: 'admin',
    SUPERADMIN: 'superadmin',
  });

const UserSchema = new mongoose.Schema({
   // Required fields:
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Enforce unique emails
    lowercase: true, // Normalize email addresses to lowercase
    validate: {
        validator: (value: string) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value);
        },
        message: 'Invalid email format',
      },
  },
  password: {
    type: String,
    required: true,
  },

  // Optional fields (based on  LMS features):
  role: {
    // Define possible roles (e.g., student, instructor, admin)
    type: String,
    enum: Object.values(RoleEnum), // Restrict values to the enum
    default: RoleEnum.STUDENT, // Default to student
  },
  coursesEnrolled: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course', // a "Course" model
    },
  ],
  profile: {
    // Additional profile information
    firstName: String,
    lastName: String,
    phone: String,
    address: String,
    // ...other fields
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
}, {
    timestamps: true // to know when user was created when was updated
  });
;

  const User=mongoose.model('User',UserSchema);
//This is collection, collection contain docs,docs contains fields like name,date. collectn name start capital
module.exports =User;