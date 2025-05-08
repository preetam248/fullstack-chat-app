import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

// user signup
export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        message: "Please enter minimum 6 characters password",
        success: false,
      });
    }
    const existUser = await User.findOne({ email });
    if (existUser) {
      return res.status(400).json({
        message: "User already exit",
        success: false,
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const createdUser = await User.create({
      fullName,
      email,
      password: hashPassword,
    });

    if (createdUser) {
      await generateToken(createdUser._id, res);
      return res.status(201).json(createdUser);
    } else {
      return res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    return res
      .status(500)
      .json({ message: "Internal Server Error", success: false });
  }
};

//user login
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "All fields are required", success: false });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid credentials", success: false });
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res
        .status(400)
        .json({ message: "Invalid credentials", success: false });
    }
    await generateToken(user._id, res);
    return res.status(200).json(user);
  } catch (error) {
    console.log("Error in login controller", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//user logout
export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", {
      maxAge: 0,
    });
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in login controller", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//user update profile
export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const user = req.user;
    if (!profilePic) {
      return res.status(401).json({ message: "Profile picture is required" });
    }
  
      const uploadResponse = await cloudinary.uploader.upload(profilePic);
      if (!uploadResponse) {
          console.log("Error while upload on cloudinary");
      }
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { profilePic: uploadResponse.secure_url },
      { new: true }
      );
      if (!updatedUser) {
          console.log("Error while update user");
      }
      return res.status(201).json(updatedUser);
  } catch (error) {
    console.log("Error in updateProfile controller", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//check user auth
export const checkAuth = async (req, res )=> {
    try {
        const user = req.user;
        res.status(200).json(user);
    } catch (error) {
        console.log("Error in checkAuth controller", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
}