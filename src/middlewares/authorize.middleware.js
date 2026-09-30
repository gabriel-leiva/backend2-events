import mongoose from "mongoose";
import { getEventById } from "../repositories/events.repository.js";
import { permissions } from "../config/permissions.config.js";


export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                status: "error",
                message: "No autenticado"
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                status: "error",
                message: "No tenés permisos para realizar esta acción"
            });
        }

        next();
    };
};


export const authorizeEventOwnerOrAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                status: "error",
                message: "No autenticado"
            });
        }
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                status: "error",
                message: "El ID del evento no es válido"
            });
        }

        const event = await getEventById(req.params.id);    

        if (!event) {
            return res.status(404).json({
                status: "error",
                message: "Evento no encontrado"
            });
        }

        const canModifyAnyEvent = permissions.MODIFY_ANY_EVENT.includes(req.user.role);

        const isOwner =
            String(event.organizer) === String(req.user.id);

        if (!canModifyAnyEvent && !isOwner) {
            return res.status(403).json({
                status: "error",
                message: "No tenés permisos para modificar este evento"
            });
        }

        req.event = event;

        next();
    } catch (error) {
        next(error);
    }
};