import express from "express";
import http from "http";
import { Server } from "socket.io";
import { sub, pub, redisClient } from "./db/redis";
import prismaClient from "./db/prisma";
import { checkRateLimit, storeToDB } from "./controllers/grid.controllers";

export const app = express();
export const httpServer = http.createServer(app);

sub.subscribe("MESSAGES");
sub.subscribe("ONLINE_USERS");

const io = new Server(httpServer, {
  cors: {
    origin: [process.env.CLIENT_URL!],
    credentials: true,
    methods: ["GET", "POST"],
  },
});

io.on("connection", async (socket) => {
  const connectedUser = socket.handshake.query.user;
  const socketId = socket.id;
  
  // console.log("user Connected", connectedUser)

  if (connectedUser) {
    await pub.sadd("activeUsers", JSON.stringify(connectedUser)); 
    const onlineUsers = await pub.smembers("activeUsers"); 
    const parsedUsers = onlineUsers.map(user => JSON.parse(user)); 
    pub.publish("ONLINE_USERS", JSON.stringify(parsedUsers)); 

  }

  socket.on("disconnect", async () => {
    if(connectedUser) {
      // console.log("user disconnected", connectedUser)
      await pub.srem("activeUsers", JSON.stringify(connectedUser));
      const onlineUsers = await pub.smembers("activeUsers"); 
      const parsedUsers = onlineUsers.map(user => JSON.parse(user)); 
      pub.publish("ONLINE_USERS", JSON.stringify(parsedUsers));
    }

  });

  socket.on("updateGrid", (message) => {
    // console.log("message received", message)

    let rateLimitFlag =false
    // check if the block is rate limitted
    checkRateLimit(message)
    .then(()=> {
      pub.publish(
        "MESSAGES",
        JSON.stringify({
          message,
        })
      );
    // console.log("grid update published!!!!!!!!!!!!!")

    })
    .catch((err)=> {
      io.to(socketId).emit("rateLimittedBlock", JSON.stringify({
        message,
        err: err.message
      }))
      // console.log("rate limit error", err.message)
    })
 
  });
});

sub.on("message", async (channel, message) => {

  if (channel === "ONLINE_USERS") {
    io.emit("getOnlineUsers", JSON.parse(message)); 
  } 
  
  else if (channel === "MESSAGES") {
    let updatedMessage = JSON.parse(message);
    let cachedGrid;

    updatedMessage= updatedMessage.message

    cachedGrid = await redisClient.get("GRID_STATE");

    //cache miss
    if (!cachedGrid) {
      const grid= await prismaClient.grid.findFirst();
      cachedGrid = JSON.stringify(grid?.state);
      return;
    }

    let gridState = cachedGrid ? JSON.parse(cachedGrid) : []; 
    gridState[updatedMessage.row][updatedMessage.col] = updatedMessage.value;

    await redisClient.set("GRID_STATE", JSON.stringify(gridState));

    io.emit("updateGrid", JSON.parse(message));

    storeToDB(gridState, updatedMessage).catch((err) => {
      console.error("Error persisting grid to db:", err);
    });
  }
});


