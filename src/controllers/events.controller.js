import {
    saveEvent,
    updateEvent as updateEventRepository
} from "../repositories/events.repository.js";


export const getEvents = (req, res) => {
    res.status(200).json({
        status: "success",
        payload: []
    });
};


export const createEvent = async (req, res, next) => {
    try {
        const eventData = {
            ...req.body,
            organizer: req.user.id
        };

        const newEvent = await saveEvent(eventData);

        res.status(201).json({
            status: "success",
            payload: {
                id: newEvent._id,
                title: newEvent.title,
                organizer: newEvent.organizer
            }
        });
    } catch (error) {
        next(error);
    }
};


export const updateEvent = async (req, res, next) => {
    try {
        const {
            organizer,
            ...updateData
        } = req.body;

        const updatedEvent = await updateEventRepository(
            req.event._id,
            updateData
        );

        res.status(200).json({
            status: "success",
            payload: {
                id: updatedEvent._id,
                title: updatedEvent.title,
                organizer: updatedEvent.organizer
            }
        });
    } catch (error) {
        next(error);
    }
};