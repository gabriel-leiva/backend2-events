import { Router } from "express";

import {
    getUsers
} from "../controllers/users.controller.js";

import {
    authenticatePassport
} from "../middlewares/passport.middleware.js";

import {
    authorizeRoles
} from "../middlewares/authorize.middleware.js";

import {
    permissions
} from "../config/permissions.config.js";


const router = Router();


router.get(
    "/",
    authenticatePassport(
        "current",
        "No autenticado",
        401,
        false
    ),
    authorizeRoles(...permissions.VIEW_ALL_USERS),
    getUsers
);


export default router;