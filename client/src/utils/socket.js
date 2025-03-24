import { io } from "socket.io-client";

const SOCKET_SERVER_URL = "https://matrix-social-media-backend.onrender.com";  

export const socket = io(SOCKET_SERVER_URL, {
    autoConnect: false, 
    reconnection: true,
    reconnectionAttempts: 5, 
    transports: ["websocket"], 
});
