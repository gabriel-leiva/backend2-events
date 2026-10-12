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
                    id:
                        ticket.user._id ??
                        ticket.user.id,
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
                    id:
                        ticket.event._id ??
                        ticket.event.id,
                    title:
                        ticket.event.title,
                    date:
                        ticket.event.date,
                    location:
                        ticket.event.location
                }
                : ticket.event;


        return {
            id: ticket._id ?? ticket.id,
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
                ticket.updatedAt
        };
    }
}