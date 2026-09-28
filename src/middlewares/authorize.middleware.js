import { getEventById } from "../repositories/events.repository.js";


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

        const event = await getEventById(req.params.eventId);

        if (!event) {
            return res.status(404).json({
                status: "error",
                message: "Evento no encontrado"
            });
        }

        const isAdmin = req.user.role === "admin";

        const isOwner =
            String(event.organizer) === String(req.user.id);

        if (!isAdmin && !isOwner) {
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