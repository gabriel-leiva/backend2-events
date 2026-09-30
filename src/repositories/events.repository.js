import {
    createEvent,
    findEventById,
    findEvents,
    countEvents,
    updateEventById
} from "../dao/events.dao.js";


export const saveEvent = async (eventData) => {
    return await createEvent(eventData);
};


export const getEventById = async (eventId) => {
    return await findEventById(eventId);
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

export const updateEvent = async (eventId, updateData) => {
    return await updateEventById(eventId, updateData);
};