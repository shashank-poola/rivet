import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import routes from "./routes/routes.js";

dotenv.config();

// Start worker process (runs in background, doesn't block server)
// Worker will process jobs from Redis queue
if (process.env.START_WORKER !== "false") {
  import("./worker/nodesexecution.js").catch((err) => {
    console.error("Failed to start worker:", err);
  });
}

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use("/api", routes);


const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;