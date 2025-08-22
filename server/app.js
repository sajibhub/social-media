import express from "express";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import cookie from "cookie";
import jwt from 'jsonwebtoken'
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import dotenv from "dotenv";
import compression from "compression";
import mongoSanitize from 'express-mongo-sanitize'
import http from "http";
import { Server } from "socket.io";

import DATABASE from "./config/DATABASE.js";
import UserAgentMiddleware from "./middleware/userAgent.js";
import userRouter from "./router/userRouter.js";
import postRouter from "./router/postRouter.js";
import Notification from "./router/notificationRouter.js";
import Story from "./router/storyRouter.js";
import Chat from "./controllers/socketController.js";

dotenv.config();
const PORT = process.env.PORT || 4000;
const app = express();

const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  }
});

const limit = rateLimit({
  windowMs: parseInt(process.env.REQ_MS, 10),
  max: parseInt(process.env.REQ_LIMIT, 10),
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

app.use(helmet())

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:"],
    },
  })
);

io.use((socket, next) => {
  try {
    const cookies = socket.handshake.headers.cookie;

    if (cookies) {
      const parsedCookies = cookie.parse(cookies);

      const token = parsedCookies.token;

      if (!token) {
        return next(new Error("Authentication error: Token missing"));
      }

      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          return next(new Error("Authentication error: Invalid token"));
        }

        socket.handshake.headers.id = decoded.userId;
        next();
      });
    } else {
      return next(new Error("Authentication error: No cookies found"));
    }
  } catch (error) {
    next(new Error("Authentication error"));
  }
});


app.use(cookieParser());
app.use((req, res, next) => {
  ['body', 'query', 'params'].forEach((key) => {
    if (req[key]) {
      const sanitized = mongoSanitize(req[key]);
      req[`sanitized${key.charAt(0).toUpperCase() + key.slice(1)}`] = sanitized;
    }
  });
  next();
});
app.use(hpp());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(UserAgentMiddleware);

app.use("/api/v1", userRouter, postRouter, Notification, Story);

// socketControllers();
Chat()

server.listen(PORT, () => {
  DATABASE();
  console.log(`Server Is Running On Port ${PORT}`);
});

