import express from "express";

import user from "./user.routes";
import auth from "./session.route";

const router = express.Router();

router.use(user);
router.use(auth);

export default router;
