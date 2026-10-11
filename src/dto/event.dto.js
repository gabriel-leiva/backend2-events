export class EventDTO {

    static toPublicResponse(eventRaw) {
        if (!eventRaw) {
            return null;
        }

        const event =
            typeof eventRaw.toObject === "function"
                ? eventRaw.toObject()
                : { ...eventRaw };

        return {
            _id: event._id,
            title: event.title,
            description: event.description,
            category: event.category,
            date: event.date,
            location: event.location,
            capacity: event.capacity,
            price: event.price,
            status: event.status,
            organizer: event.organizer,
            createdAt: event.createdAt,
            updatedAt: event.updatedAt,
            __v: event.__v
        };
    }


    static toSummaryResponse(eventRaw) {
        if (!eventRaw) {
            return null;
        }

        return {
            id: eventRaw._id ?? eventRaw.id,
            title: eventRaw.title,
            organizer: eventRaw.organizer
        };
    }


    static toStatusResponse(eventRaw) {
        if (!eventRaw) {
            return null;
        }

        return {
            id: eventRaw._id ?? eventRaw.id,
            title: eventRaw.title,
            status: eventRaw.status,
            organizer: eventRaw.organizer
        };
    }
}