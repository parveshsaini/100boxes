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
  
  console.log("user Connected", connectedUser)

  if (connectedUser) {
    await pub.sadd("activeUsers", JSON.stringify(connectedUser)); 
    const onlineUsers = await pub.smembers("activeUsers"); 
    const parsedUsers = onlineUsers.map(user => JSON.parse(user)); 
    pub.publish("ONLINE_USERS", JSON.stringify(parsedUsers)); 

  }

  socket.on("disconnect", async () => {
    // console.log("A user disconnected from socket");
    if(connectedUser) {
      console.log("user disconnected", connectedUser)
      await pub.srem("activeUsers", JSON.stringify(connectedUser));
      const onlineUsers = await pub.smembers("activeUsers"); 
      const parsedUsers = onlineUsers.map(user => JSON.parse(user)); 
      pub.publish("ONLINE_USERS", JSON.stringify(parsedUsers));
    }

  });

  socket.on("updateGrid", (message) => {
    // console.log("Message from user", message);
    pub.publish(
      "MESSAGES",
      JSON.stringify({
        message,
      })
    );
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

    // console.log("cachedGrid: ", cachedGrid);

    let gridState = cachedGrid ? JSON.parse(cachedGrid) : []; 

    // console.log("gridState: ", gridState);

    // console.log("updatedMessage", updatedMessage);

    gridState[updatedMessage.row][updatedMessage.col] = updatedMessage.value;
    await redisClient.set("GRID_STATE", JSON.stringify(gridState));


    io.emit("updateGrid", JSON.parse(message));

    storeToDB(gridState, updatedMessage).catch((err) => {
      console.error("Error persisting grid to db:", err);
    });
  }
});

interface IUser {
  id: number;
  email: string;
  name: string;
  imageUrl: string;
}

async function storeToDB(gridState: string[][], updatedMessage: {
  row: number;
  col: number;
  value: string;
  user: IUser;
}) {
  try {
    
    await prismaClient.$transaction(async (txn)=> {
      await txn.grid.update({
        where: { id: 1 },  
        data: { state: gridState }
      });
      console.log("Grid state persisted to db.");

      await txn.history.create({
        data: {
          row: updatedMessage.row,
          col: updatedMessage.col,
          character: updatedMessage.value,
          userId: updatedMessage.user.id,
          state: gridState
        }
      });
      console.log(`user ${updatedMessage.user.name} updated grid at ${updatedMessage.row}, ${updatedMessage.col} to ${updatedMessage.value}`);
      console.log("History entry persisted to db.");
    })

    console.log("transaction successful");
  } catch (error) {
    console.error("Failed to persist grid to db:", error);
  }
}
