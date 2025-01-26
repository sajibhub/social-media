import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const socketMiddleware = async (socket, next) => {
    try {
        const { token } = socket.handshake.headers.cookie

        if (!token) {
            return next(new Error("Unauthorized: No token provided"));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return next(new Error("Unauthorized: Invalid token"));
        }

        const user = await User.findById(decoded.userId);
        if (!user) {
            return next(new Error("Unauthorized: User not found"));
        }

        socket.handshake.headers.id = user._id.toString();

        next();
    } catch (error) {
        console.error("Socket authentication error:", error.message);
        next(new Error("Unauthorized: Authentication failed"));
    }
};

export default socketMiddleware;
