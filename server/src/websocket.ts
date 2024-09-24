import express from "express";
import http from "http";
import { Server } from "socket.io";

export const app = express()
export const httpServer= http.createServer(app)


const io = new Server(httpServer, {
	cors: {
        origin: true,
        methods: ["GET", "POST"]
    }
});
io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("disconnect", () => {
        console.log("A user disconnected from socket");
    });

    socket.on("message", (message) => {
        console.log("Message from user", message);
    });
});

io.on("disconnect", (socket) => {
    console.log("A user disconnected");
});