import mongoose from "mongoose";

import {
    getEventById
} from "../repositories/events.repository.js";

import {
    permissions
} from "../config/permissions.config.js";


export const getAuthorizedEventForModification = async (
    eventId,
    user
) => {
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        const error = new Error(
            "El ID del evento no es válido"
        );

        error.statusCode = 400;

        throw error;
    }


    const event = await getEventById(eventId);


    if (!event) {
        const error = new Error(
            "Evento no encontrado"
        );

        error.statusCode = 404;

        throw error;
    }


    const canModifyAnyEvent =
        permissions.MODIFY_ANY_EVENT.includes(
            user.role
        );

    const isOwner =
        String(event.organizer) ===
        String(user.id);


    if (!canModifyAnyEvent && !isOwner) {
        const error = new Error(
            "No tenés permisos para modificar este evento"
        );

        error.statusCode = 403;

        throw error;
    }


    return event;
};