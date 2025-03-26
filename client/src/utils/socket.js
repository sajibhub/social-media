import { io } from "socket.io-client";

const SOCKET_SERVER_URL = import.meta.env.VITE_API_URL

export const socket = io(SOCKET_SERVER_URL, {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    transports: ["websocket"],
});
