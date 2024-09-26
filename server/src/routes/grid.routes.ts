import { Router } from "express";
import { getGrid, getHistory } from "../controllers/grid.controllers";

const gridRouter: Router= Router()

gridRouter.route("/").get(getGrid)

gridRouter.route("/history").get(getHistory)

// Upsert route is deprecated as communication is now done via websockets
// gridRouter.route("/upsert").patch(upsertGrid)

export default gridRouter