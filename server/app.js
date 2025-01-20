import express from "express";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import dotenv from "dotenv";
import compression from "compression";
import mongodbSanitize from "mongodb-sanitize";
import { Server } from "socket.io";
import http from "http";

import DATABASE from "./config/DATABASE.js";
import UserAgentMiddleware from "./middleware/userAgent.js";
import userRouter from "./router/userRouter.js";
import postRouter from "./router/postRouter.js";
import { SocketPosts } from "./utils/socket.js";

dotenv.config();
const PORT = process.env.PORT || 4000;
const app = express();
export const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const limit = rateLimit({
  windowMs: process.env.REQ_MS,
  max: process.env.REQ_LIMIT,
  message: "Too many requests, please try again later.",
  statusCode: 429,
});

app.use(limit);
const allowedOrigins = process.env.FRONTEND_URLS.split(",");
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:"],
    },
  })
);

app.use(cookieParser());
app.use(mongodbSanitize());
app.use(hpp());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(UserAgentMiddleware);

app.use("/api/v1", userRouter, postRouter);

io.on("connection", (socket) => {
  console.log("User connected");

  SocketPosts(socket);

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(PORT, () => {
  DATABASE();
  console.log(`Server Is Running On Port ${PORT}`);
});
