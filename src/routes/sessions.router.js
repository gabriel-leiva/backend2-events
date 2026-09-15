import { Router } from "express";

import {
    getSessionsStatus,
    register,
    login,
    current,
    logout
} from "../controllers/sessions.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", getSessionsStatus);
router.post("/register", register);
router.post("/login", login);
router.get("/current", authMiddleware, current);
router.post("/logout", logout);

export default router;