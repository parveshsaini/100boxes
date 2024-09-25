import express from "express";
import http from "http";
import { Server } from "socket.io";
import { sub, pub, redisClient } from "./db/redis";
import prismaClient from "./db/prisma";

export const app = express();
export const httpServer = http.createServer(app);

sub.subscribe("MESSAGES");
sub.subscribe("ONLINE_USERS");

const io = new Server(httpServer, {
  cors: {
    origin: true,
    methods: ["GET", "POST"],
  },
});

io.on("connection", async (socket) => {
  const connectedUser = socket.handshake.query.user;
  

  if (connectedUser) {
    await pub.sadd("activeUsers", JSON.stringify(connectedUser)); 
    const onlineUsers = await pub.smembers("activeUsers"); // Get the list of users
    const parsedUsers = onlineUsers.map(user => JSON.parse(user)); // Parse each user
    pub.publish("ONLINE_USERS", JSON.stringify(parsedUsers)); // Publish the parsed user objects

  }

  socket.on("updateGrid", (message) => {
    // console.log("Message from user", message);
    pub.publish(
      "MESSAGES",
      JSON.stringify({
        message,
      })
    );
  });

  socket.on("disconnect", async () => {
    // console.log("A user disconnected from socket");
    if (connectedUser) {
      await pub.srem("activeUsers", connectedUser as string);
      const onlineUsers = await pub.smembers("activeUsers"); 
      // console.log("onlineUsers: ", onlineUsers);
      pub.publish("ONLINE_USERS", JSON.stringify(onlineUsers)); 
    }
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
      console.log("Cache miss on write");
      const grid= await prismaClient.grid.findFirst();
      cachedGrid = JSON.stringify(grid?.state);
      return;
    }

    console.log("cachedGrid: ", cachedGrid);

    let gridState = cachedGrid ? JSON.parse(cachedGrid) : []; 

    // console.log("gridState: ", gridState);

    gridState[updatedMessage.row][updatedMessage.col] = updatedMessage.value;
    await redisClient.set("GRID_STATE", JSON.stringify(gridState));

    io.emit("updateGrid", JSON.parse(message));

    storeToDB(gridState).catch((err) => {
      console.error("Error persisting grid to Postgres:", err);
    });
  }
});


async function storeToDB(gridState: string[][]) {
  try {
    await prismaClient.grid.update({
      where: { id: 1 },  
      data: { state: gridState }
    });
    console.log("Grid state persisted to db.");
  } catch (error) {
    console.error("Failed to persist grid to db:", error);
  }
}
