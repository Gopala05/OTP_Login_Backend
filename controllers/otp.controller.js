import User from "../models/user.model.js";
import { v4 as uuidv4 } from "uuid";
import twilio from "twilio";
import { generateToken } from "../middleware/auth.js";
import dotenv from "dotenv";

dotenv.config();

// Initialize Twilio client
export const client = new twilio(
  process.env.TWILLIO_ACCOUNT_SID,
  process.env.TWILLIO_AUTH_TOKEN
);

export const sendOtp = async (phoneNumber, otp) => {
  return client.messages.create({
    body: `Your OTP is ${otp}`,
    from: process.env.TWILLIO_MY_NUMBER,
    to: phoneNumber,
  });
};

export const generateOtp = () => Math.floor(100000 + Math.random() * 900000);

export const requestOtp = async (phoneNumber, name) => {
  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

  // Find the user by phoneNumber
  let user = await User.findOne({ phoneNumber });

  if (!user) {
    // If the user doesn't exist, create a new one with a new user_id
    const user_id = uuidv4();
    user = await User.create({
      user_id,
      name,
      phoneNumber,
      otp,
      otpExpiry,
    });
  } else {
    // If the user exists, update their OTP and expiry time
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();
  }

  await sendOtp(phoneNumber, otp);

  return { message: "OTP sent" };
};

export const verifyOtp = async (phoneNumber, enteredOtp) => {
  const user = await User.findOne({ phoneNumber });

  if (!user) {
    throw new Error("User not found");
  }

  const currentTime = new Date();

  if (user.otp !== enteredOtp || currentTime > user.otpExpiry) {
    throw new Error("Invalid or expired OTP");
  }

  // Update user to set is_verified to true and remove otp and otpExpiry
  user.is_verified = true;
  user.otp = undefined; // Remove otp
  user.otpExpiry = undefined; // Remove otpExpiry
  await user.save();

  const accessToken = generateToken(user.user_id);
  return {
    message: "User verified successfully",
    user,
    accessToken,
  };
};

export const loginOtp = async (phoneNumber) => {
  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

  const user = await User.findOne({ phoneNumber });

  if (!user) {
    throw new Error("User not found");
  }

  user.otp = otp;
  user.otpExpiry = otpExpiry;
  await user.save();

  await sendOtp(phoneNumber, otp);

  console.log(`OTP sent successfully to ${phoneNumber}`);
  return { message: "OTP sent successfully" };
};

export const verifyLoginOtp = async (phoneNumber, enteredOtp) => {
  const user = await User.findOne({ phoneNumber });

  if (!user) {
    throw new Error("User not found");
  }

  const currentTime = new Date();

  if (user.otp !== enteredOtp || currentTime > user.otpExpiry) {
    throw new Error("Invalid or expired OTP");
  }

  // Update the user to set is_verified to true and remove otp and otpExpiry
  user.is_verified = true;
  user.otp = undefined; // Remove otp
  user.otpExpiry = undefined; // Remove otpExpiry
  await user.save();

  const accessToken = generateToken(user.user_id);
  return {
    message: "User verified successfully",
    user,
    accessToken,
  };
};
