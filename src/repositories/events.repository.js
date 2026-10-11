import {
    createEvent,
    findEventById,
    findEvents,
    countEvents,
    updateEventById,
    incrementReservationVersion
} from "../dao/events.dao.js";


export const saveEvent = async (
    eventData,
    session = null
) => {
    return await createEvent(
        eventData,
        session
    );
};


export const getEventById = async (
    eventId,
    session = null
) => {
    return await findEventById(
        eventId,
        session
    );
};


export const getFilteredEvents = async (
    filter,
    options
) => {
    return await findEvents(
        filter,
        options
    );
};


export const getEventsCount = async (filter) => {
    return await countEvents(filter);
};


export const updateEvent = async (
    eventId,
    updateData,
    session = null
) => {
    return await updateEventById(
        eventId,
        updateData,
        session
    );
};


export const lockEventForReservation = async (
    eventId,
    session
) => {
    return await incrementReservationVersion(
        eventId,
        session
    );
};