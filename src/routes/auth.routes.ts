import express from "express";
import validateResource from "../middleware/validateResources";
import { createSessionSchema } from "../schema/auth.schema";
import { createSessionHandler } from "../controller/auth.controller";

const router = express.Router();

router.post("/api/sessions", validateResource(createSessionSchema), createSessionHandler);

export default router;