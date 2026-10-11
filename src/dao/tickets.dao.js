import { TicketModel } from "../models/Ticket.js";


export const createTicket = async (
    ticketData,
    session = null
) => {
    if (session) {
        const [ticket] = await TicketModel.create(
            [ticketData],
            { session }
        );

        return ticket;
    }

    return await TicketModel.create(ticketData);
};


export const findActiveTicketByUserAndEvent = async (
    userId,
    eventId,
    session = null
) => {
    const query = TicketModel.findOne({
        user: userId,
        event: eventId,
        status: {
            $in: ["confirmed", "pending"]
        }
    });

    if (session) {
        query.session(session);
    }

    return await query;
};


export const getReservedQuantityByEvent = async (
    eventId,
    session = null
) => {
    const aggregation = TicketModel.aggregate([
        {
            $match: {
                event: eventId,
                status: {
                    $in: ["confirmed", "pending"]
                }
            }
        },
        {
            $group: {
                _id: "$event",
                totalReserved: {
                    $sum: "$quantity"
                }
            }
        }
    ]);

    if (session) {
        aggregation.session(session);
    }

    const result = await aggregation;

    return result[0]?.totalReserved || 0;
};


export const findTicketsByUser = async (userId) => {
    return await TicketModel.find({
        user: userId
    }).populate(
        "event",
        "title date location"
    );
};


export const findTicketsByEvent = async (eventId) => {
    return await TicketModel.find({
        event: eventId
    }).populate(
        "user",
        "first_name last_name email"
    );
};


export const findTicketById = async (
    ticketId,
    session = null
) => {
    const query =
        TicketModel.findById(ticketId);

    if (session) {
        query.session(session);
    }

    return await query;
};


export const updateTicketById = async (
    ticketId,
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

    return await TicketModel.findByIdAndUpdate(
        ticketId,
        updateData,
        options
    );
};