import { EventModel } from "../models/Event.js";


export const createEvent = async (eventData) => {
    return await EventModel.create(eventData);
};


export const findEventById = async (eventId) => {
    return await EventModel.findById(eventId);
};

export const findEvents = async (
    filter,
    {
        skip,
        limit,
        sort
    }
) => {
    return await EventModel.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit);
};


export const countEvents = async (filter) => {
    return await EventModel.countDocuments(filter);
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