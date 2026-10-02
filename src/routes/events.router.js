import { Router } from "express";

import {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    updateEventStatus
} from "../controllers/events.controller.js";

import {
    authenticatePassport
} from "../middlewares/passport.middleware.js";

import {
    authorizeRoles,
    authorizeEventOwnerOrAdmin
} from "../middlewares/authorize.middleware.js";

import {
    permissions
} from "../config/permissions.config.js";

import {
    createTicket,
    getEventTickets
} from "../controllers/tickets.controller.js";


const router = Router();


router.get("/", getEvents);

router.post(
    "/:eid/tickets",
    authenticatePassport(
        "current",
        "No autenticado",
        401,
        false
    ),
    createTicket
);


router.get(
    "/:eid/tickets",
    authenticatePassport(
        "current",
        "No autenticado",
        401,
        false
    ),
    authorizeRoles(...permissions.VIEW_EVENT_TICKETS),
    getEventTickets
);

router.get("/:id", getEventById);

router.post(
    "/",
    authenticatePassport(
        "current",
        "No autenticado",
        401,
        false
    ),
    authorizeRoles(...permissions.CREATE_EVENT),
    createEvent
);


router.put(
    "/:id",
    authenticatePassport(
        "current",
        "No autenticado",
        401,
        false
    ),
    authorizeRoles(...permissions.MODIFY_OWN_EVENT),
    authorizeEventOwnerOrAdmin,
    updateEvent
);

router.patch(
    "/:id/status",
    authenticatePassport(
        "current",
        "No autenticado",
        401,
        false
    ),
    authorizeRoles(...permissions.MODIFY_OWN_EVENT),
    authorizeEventOwnerOrAdmin,
    updateEventStatus
);


export default router;