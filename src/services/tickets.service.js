import mongoose from "mongoose";
import { randomUUID } from "node:crypto";

import { getEventById } from "../repositories/events.repository.js";
import { getUserById } from "../repositories/users.repository.js";

import {
    saveTicket,
    getActiveTicketByUserAndEvent,
    getReservedQuantity,
    getTicketsByUser,
    getTicketsByEvent,
    getTicketById,
    updateTicket
} from "../repositories/tickets.repository.js";

import {
    sendTicketConfirmationEmail
} from "./mail.service.js";


const generateReservationCode = () => {
    return `TCK-${randomUUID().toUpperCase()}`;
};


export const createTicketService = async (
    eventId,
    userId,
    quantity
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


    if (event.status !== "published") {
        const error = new Error(
            "El evento no está disponible para inscripciones"
        );

        error.statusCode = 400;

        throw error;
    }


    if (new Date(event.date) <= new Date()) {
        const error = new Error(
            "No es posible inscribirse a un evento finalizado"
        );

        error.statusCode = 400;

        throw error;
    }


    if (
        typeof quantity !== "number" ||
        !Number.isInteger(quantity) ||
        quantity <= 0
    ) {
        const error = new Error(
            "La cantidad debe ser un número entero mayor a 0"
        );

        error.statusCode = 400;

        throw error;
    }


    const existingTicket =
        await getActiveTicketByUserAndEvent(
            userId,
            event._id
        );


    if (existingTicket) {
        const error = new Error(
            "Ya tenés una inscripción activa para este evento"
        );

        error.statusCode = 409;

        throw error;
    }


    const reservedQuantity =
        await getReservedQuantity(event._id);


    const availableCapacity =
        event.capacity - reservedQuantity;


    if (availableCapacity < quantity) {
        const error = new Error(
            "No hay cupos suficientes disponibles"
        );

        error.statusCode = 400;

        throw error;
    }


    const user = await getUserById(userId);

    if (!user) {
        const error = new Error(
            "Usuario no encontrado"
        );

        error.statusCode = 404;

        throw error;
    }


    const reservationCode =
        generateReservationCode();


    const ticket = await saveTicket({
        user: userId,
        event: event._id,
        status: "confirmed",
        quantity,
        reservationCode
    });


    try {
        await sendTicketConfirmationEmail({
            to: user.email,
            userName: user.first_name,
            eventTitle: event.title,
            reservationCode
        });
    } catch (error) {
        console.error(
            "No se pudo enviar el email de confirmación:",
            error.message
        );
    }


    return ticket;
};


export const getMyTicketsService = async (userId) => {
    return await getTicketsByUser(userId);
};


export const getEventTicketsService = async (
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


    const isAdmin = user.role === "admin";

    const isOwner =
        String(event.organizer) === String(user.id);


    if (!isAdmin && !isOwner) {
        const error = new Error(
            "No tenés permisos para consultar las inscripciones de este evento"
        );

        error.statusCode = 403;

        throw error;
    }


    return await getTicketsByEvent(event._id);
};


export const cancelTicketService = async (
    ticketId,
    user
) => {
    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
        const error = new Error(
            "El ID del ticket no es válido"
        );

        error.statusCode = 400;

        throw error;
    }


    const ticket = await getTicketById(ticketId);

    if (!ticket) {
        const error = new Error(
            "Ticket no encontrado"
        );

        error.statusCode = 404;

        throw error;
    }


    const isAdmin = user.role === "admin";

    const isOwner =
        String(ticket.user) === String(user.id);


    if (!isAdmin && !isOwner) {
        const error = new Error(
            "No tenés permisos para cancelar este ticket"
        );

        error.statusCode = 403;

        throw error;
    }


    if (ticket.status === "cancelled") {
        const error = new Error(
            "El ticket ya está cancelado"
        );

        error.statusCode = 400;

        throw error;
    }


    return await updateTicket(
        ticket._id,
        {
            status: "cancelled",
            cancelledAt: new Date()
        }
    );
};