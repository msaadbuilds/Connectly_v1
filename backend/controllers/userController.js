import generateToken from "../config/jwt.js";
import User from "../models/userModel.js";
import { cloudinary } from "../config/cloudinary.js";
import bcrypt from "bcryptjs";
import transporter from "../config/nodemailer.js"
import jwt from 'jsonwebtoken';

export const verifyOTP = async (req, res) => {
  const { email, OTP } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !user.Otp) {
      return res.status(200).json({ success: false, message: "Invalid or expired OTP." });
    }

    if (user.Otp !== OTP || user.OtpExpireAt < Date.now()) {
      return res.status(200).json({ success: false, message: "OTP expired or incorrect." });
    }
    user.Otp = "";
    user.OtpExpireAt = 0;
    await user.save();

    return res.status(200).json({
      success: true,
      user,
      message: "Verification Successful!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const sendOTP = async (req, res) => {
  try {
    const token = req.body.jwt;

    if (!token || token.trim() === "") {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const OTP = Math.floor(1000 + Math.random() * 9000).toString();
    const expire = Date.now() + 5 * 60 * 1000;

    user.Otp = OTP;
    user.OtpExpireAt = expire;
    await user.save();

    await transporter.sendMail({
      from: process.env.MAIL_ID,
      to: user.email,
      subject: "Email Verification Code",
      html: `<h2>Your 4-digit OTP is: ${OTP}</h2><p>This code will expire in 5 minutes.</p>`,
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email.",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const signup = async (req, res) => {
  const { fullName, email, password, bio } = req.body;

  try {

    if (!fullName || !email || !password || !bio) {
      return res.status(200).json({
        success: false,
        message: "All fields are required!",
      });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(200).json({
        success: false,
        message: "Account already exists!",
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      bio,
    });
    const token = await generateToken(newUser._id);

    return res.status(201).json({
      success: true,
      userData: newUser,
      token,
      message: "Please Verfiy Your Email!",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userData = await User.findOne({ email });

    const isCorrect = await bcrypt.compare(password, userData.password);

    if (!isCorrect) {
      return res.status(200).json({
        success: false,
        message: "Invalid Credentials!",
      });
    }

    const token = await generateToken(userData._id);

    res.status(201).json({
      success: true,
      message: "Login Successfully!",
      userData,
      token,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const checkAuth = (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
    message: "Successfully Authenticated!",
  });
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic, bio, fullName } = req.body;

    const userId = req.user._id;
    let updateUser;

    if (!profilePic) {
      updateUser = await User.findByIdAndUpdate(
        userId,
        { bio, fullName },
        { new: true }
      );
    } else {
      const upload = await cloudinary.uploader.upload(profilePic);

      updateUser = await User.findByIdAndUpdate(
        userId,
        { profilePic: upload.secure_url, bio, fullName },
        { new: true }
      );
    }

    return res.status(201).json({
      success: true,
      user: updateUser
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};