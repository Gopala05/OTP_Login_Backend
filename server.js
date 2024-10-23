import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import otpRoutes from "./routes/otpRoutes.js";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Middleware
app.set("trust proxy", 1);
app.use(cors());
app.use(helmet());
app.use(morgan("combined"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", otpRoutes);

app.get("/", (req, res) => {
  res.send("API is running");
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
