import express from "express";
import validateResource from "../middleware/validateResources";
import { createSessionSchema } from "../schema/auth.schema";
import {
  createSessionHandler,
  refreshAccessTokenHandler,
} from "../controller/auth.controller";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication endpoints
 */

/**
 * @swagger
 * /api/sessions:
 *   post:
 *     summary: Create a new session (login)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSessionInput'
 *     responses:
 *       200:
 *         description: Session created successfully, tokens set in httpOnly cookies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 csrfToken:
 *                   type: string
 *                   description: CSRF token to use in future requests
 *                   example: abc123
 */
router.post(
  "/api/sessions",
  validateResource(createSessionSchema),
  createSessionHandler
);

/**
 * @swagger
 * /api/sessions/refresh:
 *   get:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     security:
 *       - csrfToken: []
 *     responses:
 *       200:
 *         description: Returns new CSRF token, access & refresh tokens rotated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 csrfToken:
 *                   type: string
 *                   example: newCsrfToken123
 *       401:
 *         description: Unauthorized or refresh token invalid/reused
 */
router.get("/api/sessions/refresh", refreshAccessTokenHandler);

export default router;
