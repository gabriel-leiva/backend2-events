import {
    createTicketService,
    getMyTicketsService,
    getEventTicketsService,
    cancelTicketService
} from "../services/tickets.service.js";


export const createTicket = async (req, res, next) => {
    try {
        const ticket = await createTicketService(
            req.params.eid,
            req.user.id,
            req.body.quantity
        );

        res.status(201).json({
            status: "success",
            message: "Inscripción realizada correctamente",
            payload: ticket
        });
    } catch (error) {
        next(error);
    }
};


export const getMyTickets = async (req, res, next) => {
    try {
        const tickets = await getMyTicketsService(
            req.user.id
        );

        res.status(200).json({
            status: "success",
            payload: tickets
        });
    } catch (error) {
        next(error);
    }
};


export const getEventTickets = async (req, res, next) => {
    try {
        const tickets = await getEventTicketsService(
            req.params.eid,
            req.user
        );

        res.status(200).json({
            status: "success",
            payload: tickets
        });
    } catch (error) {
        next(error);
    }
};


export const cancelTicket = async (req, res, next) => {
    try {
        const ticket = await cancelTicketService(
            req.params.tid,
            req.user
        );

        res.status(200).json({
            status: "success",
            message: "Inscripción cancelada correctamente",
            payload: ticket
        });
    } catch (error) {
        next(error);
    }
};