import {
    createTicket,
    findActiveTicketByUserAndEvent,
    getReservedQuantityByEvent,
    findTicketsByUser,
    findTicketsByEvent,
    findTicketById,
    updateTicketById
} from "../dao/tickets.dao.js";


export const saveTicket = async (
    ticketData,
    session = null
) => {
    return await createTicket(
        ticketData,
        session
    );
};


export const getActiveTicketByUserAndEvent = async (
    userId,
    eventId,
    session = null
) => {
    return await findActiveTicketByUserAndEvent(
        userId,
        eventId,
        session
    );
};


export const getReservedQuantity = async (
    eventId,
    session = null
) => {
    return await getReservedQuantityByEvent(
        eventId,
        session
    );
};


export const getTicketsByUser = async (userId) => {
    return await findTicketsByUser(userId);
};


export const getTicketsByEvent = async (eventId) => {
    return await findTicketsByEvent(eventId);
};


export const getTicketById = async (
    ticketId,
    session = null
) => {
    return await findTicketById(
        ticketId,
        session
    );
};


export const updateTicket = async (
    ticketId,
    updateData,
    session = null
) => {
    return await updateTicketById(
        ticketId,
        updateData,
        session
    );
};