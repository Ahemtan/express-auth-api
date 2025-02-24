import express from "express";
import validateResource from "../middleware/validateResources";
import { createSessionSchema } from "../schema/auth.schema";
import { createSessionHandler, refreshAccessTokenHandler } from "../controller/auth.controller";

const router = express.Router();

router.post("/api/sessions", validateResource(createSessionSchema), createSessionHandler);
router.post("/api/sessions/refresh", refreshAccessTokenHandler)
export default router;