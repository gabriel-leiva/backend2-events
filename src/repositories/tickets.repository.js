import {
    createTicket,
    findActiveTicketByUserAndEvent,
    getReservedQuantityByEvent,
    findTicketsByUser,
    findTicketsByEvent,
    findTicketById,
    updateTicketById
} from "../dao/tickets.dao.js";


export const saveTicket = async (ticketData) => {
    return await createTicket(ticketData);
};


export const getActiveTicketByUserAndEvent = async (
    userId,
    eventId
) => {
    return await findActiveTicketByUserAndEvent(
        userId,
        eventId
    );
};


export const getReservedQuantity = async (eventId) => {
    return await getReservedQuantityByEvent(eventId);
};


export const getTicketsByUser = async (userId) => {
    return await findTicketsByUser(userId);
};


export const getTicketsByEvent = async (eventId) => {
    return await findTicketsByEvent(eventId);
};


export const getTicketById = async (ticketId) => {
    return await findTicketById(ticketId);
};


export const updateTicket = async (
    ticketId,
    updateData
) => {
    return await updateTicketById(
        ticketId,
        updateData
    );
};