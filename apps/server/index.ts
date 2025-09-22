import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import routes from "./routes/routes.js";

dotenv.config({ path: process.env.NODE_ENV === "production" ? ".env" : ".env.local" });

const app: express.Application = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:8081",
    "http://127.0.0.1:8081",
  ],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use("/api", routes);


const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});

export default app;