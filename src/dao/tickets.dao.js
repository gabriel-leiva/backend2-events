import { TicketModel } from "../models/Ticket.js";


export const createTicket = async (ticketData) => {
    return await TicketModel.create(ticketData);
};


export const findActiveTicketByUserAndEvent = async (
    userId,
    eventId
) => {
    return await TicketModel.findOne({
        user: userId,
        event: eventId,
        status: {
            $in: ["confirmed", "pending"]
        }
    });
};


export const getReservedQuantityByEvent = async (eventId) => {
    const result = await TicketModel.aggregate([
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


export const findTicketById = async (ticketId) => {
    return await TicketModel.findById(ticketId);
};


export const updateTicketById = async (
    ticketId,
    updateData
) => {
    return await TicketModel.findByIdAndUpdate(
        ticketId,
        updateData,
        {
            new: true,
            runValidators: true
        }
    );
};