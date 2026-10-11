import { EventModel } from "../models/Event.js";


export const createEvent = async (
    eventData,
    session = null
) => {
    if (session) {
        const [event] = await EventModel.create(
            [eventData],
            { session }
        );

        return event;
    }

    return await EventModel.create(eventData);
};


export const findEventById = async (
    eventId,
    session = null
) => {
    const query = EventModel.findById(eventId);

    if (session) {
        query.session(session);
    }

    return await query;
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


export const updateEventById = async (
    eventId,
    updateData,
    session = null
) => {
    const options = {
        returnDocument: "after",
        runValidators: true
    };

    if (session) {
        options.session = session;
    }

    return await EventModel.findByIdAndUpdate(
        eventId,
        updateData,
        options
    );
};


export const incrementReservationVersion = async (
    eventId,
    session
) => {
    return await EventModel.findByIdAndUpdate(
        eventId,
        {
            $inc: {
                reservationVersion: 1
            }
        },
        {
            returnDocument: "after",
            session
        }
    );
};