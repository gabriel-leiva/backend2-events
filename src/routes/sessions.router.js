import { Router } from "express";

import {
    getSessionsStatus,
    register,
    login,
    current,
    logout
} from "../controllers/sessions.controller.js";

import {
    authenticatePassport
} from "../middlewares/passport.middleware.js";

const router = Router();

router.get("/", getSessionsStatus);

router.post(
    "/register",
    authenticatePassport("register", "Error al registrar usuario", 400),
    register
);

router.post(
    "/login",
    authenticatePassport("login", "Credenciales inválidas", 401),
    login
);

router.get(
    "/current",
    authenticatePassport("current", "No autenticado", 401, false),
    current
);

router.post("/logout", logout);

export default router;