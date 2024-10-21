import mongoose from "mongoose";

// Create a user schema
const userSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
      unique: true,
      hashKey: true,
    },
    name: {
      type: String,
    },
    password: {
      type: String,
    },
    email: {
      type: String,
      default: "",
      unique: true,
      match: /.+\@.+\..+/,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      index: {
        global: true,
        name: "phoneNumber-index",
      },
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: Number,
    },
    otpExpiry: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Create and export the User model
const User = mongoose.model("User", userSchema);

export default User;
