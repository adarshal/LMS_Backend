import { Response } from "express";
import { redis } from "../utils/redis";

const User = require("../models/user");
//get user by Id

export const getUserById = async (id: string, res: Response) => {
  const userJson = await redis.get(id);
  if (userJson) {
    const user = JSON.parse(userJson);
    res.status(201).json({
      success: true,
      user,
    });
  }
};


//get all user
export  const getAllUsersService = async ( res: Response) => {
  try {
    const users = await User.find().sort({createdAt:-1} );
    res.status(201).json({
      success: true,
      users,
    });
  }catch(err:any){

  }
}

//update user role
export  const updateUserRoleService = async ( res: Response,id:string,role:string) => {
  try {
    const user = await User.findByIdAndUpdate(id,{role},{new :true})

    res.status(201).json({
      success: true,
      user,
    });
  }catch(err:any){

  }
}