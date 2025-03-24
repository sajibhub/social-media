import { io } from "../app.js";

export const socketJoin = () => {
    io.on("connection", (socket) => {
        socket.on("join", (id) => {
            if (id) {
                socket.join(id);
            }
        });

        socket.on("disconnect", () => {
        });
    });
};
