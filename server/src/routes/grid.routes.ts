import { Router } from "express";
import { getGrid, upsertGrid } from "../controllers/grid.controllers";

const gridRouter: Router= Router()

gridRouter.route("/").get(getGrid)

gridRouter.route("/upsert").patch(upsertGrid)

export default gridRouter