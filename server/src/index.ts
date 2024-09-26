require('dotenv').config()
import cors from "cors"
import express from "express"
import { app, httpServer } from "./websocket";
import userRouter from "./routes/user.routes";
import gridRouter from "./routes/grid.routes";

//cache control
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    next();
});

app.use(cors({
    origin: true
}));

app.use(express.json())

app.get("/health", (req, res) => {
    res.send("Ok");
});

app.use("/api/v1/user", userRouter)

app.use("/api/v1/grid", gridRouter)

httpServer.listen(process.env.PORT, () => {
    console.log("Server is running on port ", process.env.PORT);
});