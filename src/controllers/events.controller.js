import {
    createEventService,
    updateEventService,
    getEventByIdService,
    getEventsService,
    updateEventStatusService
} from "../services/events.service.js";


export const getEvents = async (
    req,
    res,
    next
) => {
    try {
        const result =
            await getEventsService(
                req.query
            );


        res.status(200).json({
            status: "success",
            ...result
        });
    } catch (error) {
        next(error);
    }
};


export const getEventById = async (
    req,
    res,
    next
) => {
    try {
        const event =
            await getEventByIdService(
                req.params.id
            );


        res.status(200).json({
            status: "success",
            payload: event
        });
    } catch (error) {
        next(error);
    }
};


export const createEvent = async (
    req,
    res,
    next
) => {
    try {
        const newEvent =
            await createEventService(
                req.body ?? {},
                req.user.id
            );


        res.status(201).json({
            status: "success",
            payload: newEvent
        });
    } catch (error) {
        next(error);
    }
};


export const updateEvent = async (
    req,
    res,
    next
) => {
    try {
        const updatedEvent =
            await updateEventService(
                req.event,
                req.body ?? {}
            );


        res.status(200).json({
            status: "success",
            payload: updatedEvent
        });
    } catch (error) {
        next(error);
    }
};


export const updateEventStatus = async (
    req,
    res,
    next
) => {
    try {
        const updatedEvent =
            await updateEventStatusService(
                req.event,
                req.body?.status
            );


        res.status(200).json({
            status: "success",
            payload: updatedEvent
        });
    } catch (error) {
        next(error);
    }
};