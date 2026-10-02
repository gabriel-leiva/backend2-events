import { Router } from "express";

import {
    getMyTickets,
    cancelTicket
} from "../controllers/tickets.controller.js";

import {
    authenticatePassport
} from "../middlewares/passport.middleware.js";


const router = Router();


router.get(
    "/my-tickets",
    authenticatePassport(
        "current",
        "No autenticado",
        401,
        false
    ),
    getMyTickets
);


router.patch(
    "/:tid/cancel",
    authenticatePassport(
        "current",
        "No autenticado",
        401,
        false
    ),
    cancelTicket
);


export default router;