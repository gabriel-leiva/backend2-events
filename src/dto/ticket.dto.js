export class TicketDTO {

    static toPublicResponse(ticketRaw) {
        if (!ticketRaw) {
            return null;
        }

        const ticket =
            typeof ticketRaw.toObject === "function"
                ? ticketRaw.toObject()
                : { ...ticketRaw };


        const user =
            ticket.user &&
            typeof ticket.user === "object" &&
            ticket.user.email
                ? {
                    _id: ticket.user._id,
                    first_name:
                        ticket.user.first_name,
                    last_name:
                        ticket.user.last_name,
                    email:
                        ticket.user.email
                }
                : ticket.user;


        const event =
            ticket.event &&
            typeof ticket.event === "object" &&
            ticket.event.title
                ? {
                    _id: ticket.event._id,
                    title:
                        ticket.event.title,
                    date:
                        ticket.event.date,
                    location:
                        ticket.event.location
                }
                : ticket.event;


        return {
            _id: ticket._id,
            user,
            event,
            status: ticket.status,
            quantity: ticket.quantity,
            reservationCode:
                ticket.reservationCode,
            cancelledAt:
                ticket.cancelledAt,
            createdAt:
                ticket.createdAt,
            updatedAt:
                ticket.updatedAt,
            __v: ticket.__v
        };
    }
}