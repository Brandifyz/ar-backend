import express from "express";
import { config } from "dotenv";
import colors from "colors";
import cors from "cors";
import cloudinary from "cloudinary";
import Razorpay from "razorpay";
import cookieParser from "cookie-parser";
import connectDB from "./config/connectDb.js";
import userRoute from "./routes/userRoute.js";
import discoveryCall from "./routes/discoveryCall.js";
import paymentRoute from "./routes/paymentRoute.js";

config({
  path: "./config/config.env",
});
connectDB();
cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
export const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
const app = express();
// middleware

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/call", discoveryCall);
app.use("/api/v1/payment", paymentRoute);

app.get("/", (req, res) => {
  res.send(`<h1>welcome to Ar World</h1>`);
});
app.listen(process.env.PORT, () => {
  console.log(`server is connecting at ${process.env.PORT}`.bgCyan.white);
});
