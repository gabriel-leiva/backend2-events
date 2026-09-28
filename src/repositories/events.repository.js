import {
    createEvent,
    findEventById,
    updateEventById
} from "../dao/events.dao.js";


export const saveEvent = async (eventData) => {
    return await createEvent(eventData);
};


export const getEventById = async (eventId) => {
    return await findEventById(eventId);
};


export const updateEvent = async (eventId, updateData) => {
    return await updateEventById(eventId, updateData);
};