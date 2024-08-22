import express from "express";
import validateResource from "../middleware/validateResources";
import { createUserSchema } from "../schema/user.schema";
import { createUserHandler } from "../controller/user.controller";

const router = express.Router();

router.post("/api/users", validateResource(createUserSchema), createUserHandler)

export default router;