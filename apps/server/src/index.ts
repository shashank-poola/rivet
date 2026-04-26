import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import mainRouter from "./routes/index.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors({
  origin: [
    "http://localhost:5173",
  ],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.use("/api/v1", mainRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});