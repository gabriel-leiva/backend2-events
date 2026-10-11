import {
    getAuthorizedEventForModification
} from "../services/authorization.service.js";


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


export const authorizeEventOwnerOrAdmin = async (
    req,
    res,
    next
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                status: "error",
                message: "No autenticado"
            });
        }

        const event =
            await getAuthorizedEventForModification(
                req.params.id,
                req.user
            );

        req.event = event;

        next();
    } catch (error) {
        next(error);
    }
};