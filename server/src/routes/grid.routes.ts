import { Router } from "express";
import { getGrid, getHistory, upsertGrid } from "../controllers/grid.controllers";

const gridRouter: Router= Router()

gridRouter.route("/").get(getGrid)

gridRouter.route("/history").get(getHistory)

gridRouter.route("/upsert").patch(upsertGrid)

export default gridRouter