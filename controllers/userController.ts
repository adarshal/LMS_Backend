import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs"; // For password hashing
import jwt from "jsonwebtoken"; // For generating JWTs
import { catchAsyncError } from "../middleware/catchAsyncError";
import path from "path";
import ejs from "ejs";
import sendMail from "../utils/sendMail";
import { ErrorHandler } from "../utils/ErrorHandler";
import { json } from "stream/consumers";
const User = require("../models/user");

//register user
interface IRegistrationBody {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}

export const signup = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body;
      // Check for existing user
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return next(new ErrorHandler("User already exists", 400));
      }
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      const userToRegister: IRegistrationBody = {
        name,
        email,
        password: hashedPassword,
      };
      const activationToken = createActivationToken(userToRegister);
      const activationCode = activationToken.activationCode;
      const data = { user: { name: userToRegister.name }, otp: activationCode };
      const html = await ejs.renderFile(
        path.join(__dirname, "../mails/signup_activation.ejs"),
        data
      );
      try {
        await sendMail({
          email: userToRegister.email,
          subject: "Activate Account",
          template: "signup_activation.ejs",
          data: data,
        });
        return res.status(201).json({
          success: true,
          message: `Please check your email ${userToRegister.email} for account Activation`,
          activationToken: activationToken.token,
        });
      } catch (error: any) {
        return new ErrorHandler(error.message, 400);
      }
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 400));
    }
  }
);

interface IActivationToken {
  token: string;
  activationCode: string;
}

export const createActivationToken = (user: any): IActivationToken => {
  const activationCodeNum = Math.floor(Math.random() * 9000) + 1000; // Generate a random 4-digit number
  // console.log(activationCodeNum);
  const activationCode = activationCodeNum.toString(); // Convert to string
  const token = jwt.sign(
    { user:user, activationCode },
    process.env.JWT_ACTIVATION_SECRET!,
    { expiresIn: "5m" }
  ); //Expires in one hour
  return { token, activationCode };
};

interface IActivationRequest {
  activation_token: string;
  activation_code: string;
}

export const activateUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { activation_token, activation_code } =req.body as IActivationRequest;
      const newUser = jwt.verify(
        activation_token,
        process.env.JWT_ACTIVATION_SECRET as string
      ) as{user:any, activationCode:string};
      if (newUser.activationCode!== activation_code){
        return next(new ErrorHandler("Invalid Activation Code",400));
      }
      const {name,email,password} =newUser.user;
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return next(new ErrorHandler("User already exists", 400));
      }
      const user=await User.create({
        name,email,password
      })
      return res.status(200).json({
        success:"true",
        message:"Account created successfully!"
      })
    } catch (error) {}
  }
);//2.45

const signin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1h",
      }
    );

    res.json({
      message: "Signin successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const update = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    // Find user
    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true, // Return updated document
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Handle password updates securely (optional)
    if (updates.password) {
      const hashedPassword = await bcrypt.hash(updates.password, 10);
      user.password = hashedPassword;
      await user.save();
    }

    res.json({ message: "User updated successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const getUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    await User.findByIdAndDelete(userId);

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};
//2.03
