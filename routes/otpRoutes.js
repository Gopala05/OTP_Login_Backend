import express from "express";
import {
  requestOtp,
  verifyOtp,
  loginOtp,
  verifyLoginOtp,
  generateOtp,
  sendOtp,
} from "../controllers/otp.controller.js";
import User from "../models/user.model.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

router.post("/", async (req, res) => {
  const { phoneNumber, enteredOtp } = req.body;

  try {
    if (enteredOtp) {
      // Verify OTP for login or completing registration
      const result = await verifyLoginOtp(phoneNumber, enteredOtp);
      result.is_verified = true;
      return res.status(200).json(result);
    } else {
      // Check if user exists
      const user = await User.findOne({ phoneNumber });

      if (!user) {
        // User does not exist, create a temporary user
        const otp = generateOtp();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

        // Create a new temporary user
        const newUser = new User({
          user_id: uuidv4(),
          phoneNumber,
          otp,
          name: "",
          otpExpiry,
        });
        await newUser.save();

        // Send OTP to the user
        await sendOtp(phoneNumber, otp);

        return res.status(201).json({
          message: "User created. Please complete your registration.",
        });
      } else {
        // User exists, send OTP for login
        const result = await loginOtp(phoneNumber);
        return res
          .status(200)
          .json({ message: "OTP sent. Please verify to log in." });
      }
    }
  } catch (error) {
    console.error("Error details:", error);
    res.status(400).json({ error: error.message });
  }
});

export default router;
