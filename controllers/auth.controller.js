import User from "../models/user.model.js";
import { validateSignupInput } from "../inputValidation/validate.js";
import bcryptjs from "bcryptjs";
import { z } from "zod";
import { generateTokenAndSetCookie } from "../lib/utils/generateTokenAndSetCookie.js";
import { sendWelcomeMail } from "../nodemailer/mail.js";

//signup controller
export const signupController = async (req, res) => {
  try {
    const { username, fullName, password, email } = validateSignupInput.parse(
      req.body
    );

    if (!username || !fullName || !password || !email) {
      return res.status(400).json({
        message: "All field are required!",
        success: false,
      });
    }

    const existingUserByUsername = await User.findOne({ username });

    if (existingUserByUsername) {
      return res.status(400).json({
        message: "Username already taken!",
        success: false,
      });
    }

    const existingUserByEmail = await User.findOne({ email });

    if (existingUserByEmail) {
      return res.status(400).json({
        message: "Email already taken!",
        success: false,
      });
    }

    const hashPassword = await bcryptjs.hash(password, 10);

    const user = await User.create({
      username,
      fullName,
      email,
      password: hashPassword,
    });

    if (user) {
      await sendWelcomeMail(email, username);
      generateTokenAndSetCookie(user._id, res);
      return res.status(201).json({
        message: "User created successfully.",
        user: { ...user._doc, password: undefined },
        success: true,
      });
    } else {
      return res.status(400).json({
        message: "Failed to create user.",
        success: false,
      });
    }
  } catch (error) {
        console.log(`Error in signup controller. ${ error.message }`);
      if (error instanceof z.ZodError) {
          console.log(`Internal Server Error ${ error }.`);
      return res.status(500).json({
       error: error.errors.map((err) => err.message),
        success: false,
      });
      } else {
     console.log(`Internal Server Error ${ error.message }.`);
      return res.status(500).json({
        error: error,
        success: false,
      });
    }
  }
};

//login controller
export const loginController = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        const isPasswordValid = await bcryptjs.compare(password, user?.password || ""); 
        
        if (!user || !isPasswordValid) {
            return res.status(400).json({
                message: "Invalid username or password.",
                success: false,
            });
        } else {
            generateTokenAndSetCookie(user._id, res);
            return res.status(200).json({
                message: "Login successful.",
                user: { ...user._doc, password: undefined },
                success: true,
            });
        }
    } catch (error) {
       console.log(`Error in login controller. ${ error.message }`);
        return res.status(500).json({
          error: error || "Something went wrong.",
          success: false,
        });
      
    }
};

//logout controller
export const logoutController = async (req, res) => {
    try {
        res.clearCookie("token");
        return res.status(200).json({
            message: "Logged out successfully.",
            success: true,
        });
    } catch (error) {
        console.log(`Error in logout controller. ${error.message}`);
        return res.status(500).json({
            error: error || "Something went wrong",
            success: false,
        });
       
    }
   
};

//get user controller
export const getMeController = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    return res.status(200).json(user);
  } catch (error) {
    console.log("error in getMe controller", error.message);
    return res.status(500).json({ error: "Internal Server Error." });
    }
}