import express from "express";
import validateResource from "../middleware/validateResources";
import { createSessionSchema } from "../schema/auth.schema";
import requireUser from "../middleware/requireLogin";
import deserializeUser from "../middleware/deserializeUser";

import {
  createSessionController,
  refreshSessionController,
  deleteSessionController,
  getUserSessionsController,
} from "../controller/session.controller";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Sessions
 *     description: Session management & authentication
 */

/**
 * @swagger
 * /api/sessions:
 *   post:
 *     summary: Login (create session)
 *     tags: [Sessions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSessionInput'
 *     responses:
 *       200:
 *         description: Session created successfully
 *   get:
 *     summary: List active user sessions (devices)
 *     tags: [Sessions]
 *     security:
 *       - csrfToken: []
 *     responses:
 *       200:
 *         description: List of active sessions
 */
router.post(
  "/api/sessions",
  validateResource({ body: createSessionSchema }),
  createSessionController
);

router.get(
  "/api/sessions",
  deserializeUser,
  requireUser,
  getUserSessionsController
);

/**
 * @swagger
 * /api/sessions/refresh:
 *   post:
 *     summary: Refresh access token (rotate session)
 *     tags: [Sessions]
 *     responses:
 *       200:
 *         description: New access token issued
 *       401:
 *         description: Session expired or invalid
 */
router.post("/api/sessions/refresh", refreshSessionController);

/**
 * @swagger
 * /api/sessions/current:
 *   delete:
 *     summary: Logout current session
 *     tags: [Sessions]
 *     security:
 *       - csrfToken: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.delete(
  "/api/sessions/current",
  deserializeUser,
  requireUser,
  deleteSessionController
);

export default router;
