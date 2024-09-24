
import cors from "cors"
import express from "express"

import { app, httpServer } from "./websocket";


app.use(cors({
    origin: true
}));
app.use(express.json())




app.get("/", (req, res) => {
    res.send("Hello World");
});

httpServer.listen(3000, () => {
    console.log("Server is running on port 3000");
});