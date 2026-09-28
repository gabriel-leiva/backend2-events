import { EventModel } from "../models/Event.js";


export const createEvent = async (eventData) => {
    return await EventModel.create(eventData);
};


export const findEventById = async (eventId) => {
    return await EventModel.findById(eventId);
};


export const updateEventById = async (eventId, updateData) => {
    return await EventModel.findByIdAndUpdate(
        eventId,
        updateData,
        {
            new: true,
            runValidators: true
        }
    );
};