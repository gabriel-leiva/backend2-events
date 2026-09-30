import mongoose from "mongoose";
import {
    saveEvent,
    getEventById,
    getFilteredEvents,
    getEventsCount,
    updateEvent
} from "../repositories/events.repository.js";


export const createEventService = async (
    eventData,
    organizerId
) => {
        const requiredStringFields = [
        "title",
        "description",
        "category",
        "location"
    ];


    const hasMissingField = requiredStringFields.some(
        (field) =>
            typeof eventData[field] !== "string" ||
            !eventData[field].trim()
    );


    if (hasMissingField) {
        const error = new Error(
            "Faltan campos obligatorios del evento"
        );

        error.statusCode = 400;

        throw error;
    }
    
    const eventDate = new Date(eventData.date);

    if (
        Number.isNaN(eventDate.getTime()) ||
        eventDate < new Date()
    ) {
        const error = new Error(
            "La fecha del evento no puede estar en el pasado"
        );

        error.statusCode = 400;

        throw error;
    }


    if (
        typeof eventData.capacity !== "number" ||
        eventData.capacity <= 0
    ) {
        const error = new Error(
            "La capacidad debe ser mayor a 0"
        );

        error.statusCode = 400;

        throw error;
    }


    if (
        eventData.price !== undefined &&
        (
            typeof eventData.price !== "number" ||
            eventData.price < 0
        )
    ) {
        const error = new Error(
            "El precio no puede ser negativo"
        );

        error.statusCode = 400;

        throw error;
    }


    const newEventData = {
        ...eventData,
        organizer: organizerId,
        status: "draft"
    };


    return await saveEvent(newEventData);
};

export const updateEventService = async (
    event,
    eventData
) => {
    if (event.status === "cancelled") {
        const error = new Error(
            "No se puede modificar un evento cancelado"
        );

        error.statusCode = 400;

        throw error;
    }


    const {
        organizer,
        status,
        ...updateData
    } = eventData;

    const stringFields = [
        "title",
        "description",
        "category",
        "location"
    ];


    const hasInvalidStringField = stringFields.some(
        (field) =>
            updateData[field] !== undefined &&
            (
                typeof updateData[field] !== "string" ||
                !updateData[field].trim()
            )
    );


    if (hasInvalidStringField) {
        const error = new Error(
            "Los campos de texto del evento no pueden estar vacíos"
        );

        error.statusCode = 400;

        throw error;
    }

    if (updateData.date !== undefined) {
    const eventDate = new Date(updateData.date);

    if (
        Number.isNaN(eventDate.getTime()) ||
        eventDate < new Date()
    ) {
        const error = new Error(
            "La fecha del evento no puede estar en el pasado"
        );

        error.statusCode = 400;

        throw error;
    }
}


    if (
        updateData.capacity !== undefined &&
        (
            typeof updateData.capacity !== "number" ||
            updateData.capacity <= 0
        )
    ) {
        const error = new Error(
            "La capacidad debe ser mayor a 0"
        );

        error.statusCode = 400;

        throw error;
    }


    if (
        updateData.price !== undefined &&
        (
            typeof updateData.price !== "number" ||
            updateData.price < 0
        )
    ) {
        const error = new Error(
            "El precio no puede ser negativo"
        );

        error.statusCode = 400;

        throw error;
    }


    return await updateEvent(
        event._id,
        updateData
    );
};

export const getEventByIdService = async (eventId) => {
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        const error = new Error(
            "El ID del evento no es válido"
        );

        error.statusCode = 400;

        throw error;
    }
    const event = await getEventById(eventId);

    if (!event) {
        const error = new Error(
            "Evento no encontrado"
        );

        error.statusCode = 404;

        throw error;
    }

    return event;
};

export const getEventsService = async (query) => {
    const {
        status,
        category,
        location,
        dateFrom,
        dateTo,
        page = "1",
        limit = "10",
        sort = "date"
    } = query;


    const parsedPage = Number(page);
    const parsedLimit = Number(limit);


    if (
        !Number.isInteger(parsedPage) ||
        parsedPage <= 0
    ) {
        const error = new Error(
            "La página debe ser un número entero mayor a 0"
        );

        error.statusCode = 400;

        throw error;
    }


    if (
        !Number.isInteger(parsedLimit) ||
        parsedLimit <= 0
    ) {
        const error = new Error(
            "El límite debe ser un número entero mayor a 0"
        );

        error.statusCode = 400;

        throw error;
    }


    const filter = {};


    if (status) {
        const validStatuses = [
            "draft",
            "published",
            "cancelled",
            "finished"
        ];

        if (!validStatuses.includes(status)) {
            const error = new Error(
                "El estado del evento no es válido"
            );

            error.statusCode = 400;

            throw error;
        }

        filter.status = status;
    }


    if (category) {
        filter.category = category;
    }


    if (location) {
        filter.location = location;
    }


    if (dateFrom || dateTo) {
        filter.date = {};
    }


    if (dateFrom) {
        const fromDate = new Date(dateFrom);

        if (Number.isNaN(fromDate.getTime())) {
            const error = new Error(
                "dateFrom no contiene una fecha válida"
            );

            error.statusCode = 400;

            throw error;
        }

        filter.date.$gte = fromDate;
    }


    if (dateTo) {
        const toDate = new Date(dateTo);

        if (Number.isNaN(toDate.getTime())) {
            const error = new Error(
                "dateTo no contiene una fecha válida"
            );

            error.statusCode = 400;

            throw error;
        }

        filter.date.$lte = toDate;
    }


    if (
        filter.date?.$gte &&
        filter.date?.$lte &&
        filter.date.$gte > filter.date.$lte
    ) {
        const error = new Error(
            "dateFrom no puede ser posterior a dateTo"
        );

        error.statusCode = 400;

        throw error;
    }


    const descending = sort.startsWith("-");
    const sortField = descending
        ? sort.slice(1)
        : sort;

    const allowedSortFields = [
        "date",
        "price",
        "title",
        "createdAt"
    ];


    if (!allowedSortFields.includes(sortField)) {
        const error = new Error(
            "El campo de ordenamiento no es válido"
        );

        error.statusCode = 400;

        throw error;
    }


    const sortOption = {
        [sortField]: descending ? -1 : 1
    };

    const skip =
        (parsedPage - 1) * parsedLimit;


    const [events, total] = await Promise.all([
        getFilteredEvents(
            filter,
            {
                skip,
                limit: parsedLimit,
                sort: sortOption
            }
        ),
        getEventsCount(filter)
    ]);


    return {
        data: events,
        page: parsedPage,
        limit: parsedLimit,
        total,
        totalPages: Math.ceil(
            total / parsedLimit
        )
    };
};

export const updateEventStatusService = async (
    event,
    newStatus
) => {
    const validStatuses = [
        "draft",
        "published",
        "cancelled",
        "finished"
    ];


    if (!validStatuses.includes(newStatus)) {
        const error = new Error(
            "El estado del evento no es válido"
        );

        error.statusCode = 400;

        throw error;
    }
    
    if (
        newStatus === "published" &&
        new Date(event.date) < new Date()
    ) {
        const error = new Error(
            "No se puede publicar un evento cuya fecha ya pasó"
        );

        error.statusCode = 400;

        throw error;
    }

    if (event.status === "cancelled") {
        const error = new Error(
            "No se puede cambiar el estado de un evento cancelado"
        );

        error.statusCode = 400;

        throw error;
    }


    if (
        newStatus === "published" &&
        event.status === "finished"
    ) {
        const error = new Error(
            "No se puede publicar un evento finalizado"
        );

        error.statusCode = 400;

        throw error;
    }


    return await updateEvent(
        event._id,
        {
            status: newStatus
        }
    );
};