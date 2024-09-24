require('dotenv').config()
import cors from "cors"
import express from "express"
import { app, httpServer } from "./websocket";
import userRouter from "./routes/user.routes";
import gridRouter from "./routes/grid.routes";


app.use(cors({
    origin: true
}));

app.use(express.json())

app.get("/health", (req, res) => {
    res.send("Ok");
});

app.use("/api/v1/user", userRouter)

app.use("/api/v1/grid", gridRouter)

httpServer.listen(3000, () => {
    console.log("Server is running on port 3000");
});