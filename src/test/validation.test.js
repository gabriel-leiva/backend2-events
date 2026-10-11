import test, {
    before,
    after
} from "node:test";

import assert from "node:assert/strict";
import mongoose from "mongoose";
import request from "supertest";

import {
    MongoMemoryReplSet
} from "mongodb-memory-server";


let mongoReplSet;
let app;

let saveUser;
let createHash;


const createOrganizerFixture = async (
    organizerData
) => {
    const hashedPassword =
        await createHash(
            organizerData.password
        );


    return await saveUser({
        first_name:
            organizerData.first_name,
        last_name:
            organizerData.last_name,
        email:
            organizerData.email,
        password:
            hashedPassword,
        role: "organizer"
    });
};


before(async () => {
    process.env.NODE_ENV = "test";
    process.env.JWT_SECRET = "test-secret";
    process.env.JWT_EXPIRES_IN = "1h";

    process.env.MAIL_HOST = "localhost";
    process.env.MAIL_PORT = "2525";
    process.env.MAIL_USER = "test";
    process.env.MAIL_PASS = "test";
    process.env.MAIL_FROM =
        "test@example.com";


    mongoReplSet =
        await MongoMemoryReplSet.create({
            replSet: {
                count: 1
            }
        });


    await mongoose.connect(
        mongoReplSet.getUri()
    );


    const appModule = await import(
        "../app.js"
    );

    app = appModule.default;


    const usersRepositoryModule =
        await import(
            "../repositories/users.repository.js"
        );

    saveUser =
        usersRepositoryModule.saveUser;


    const hashModule = await import(
        "../utils/hash.js"
    );

    createHash =
        hashModule.createHash;


    const mailerModule = await import(
        "../config/mailer.config.js"
    );

    mailerModule.transporter.sendMail =
        async () => ({
            messageId: "test-email"
        });
});


after(async () => {
    await mongoose.disconnect();

    if (mongoReplSet) {
        await mongoReplSet.stop();
    }
});


test(
    "validaciones defensivas de eventos y tickets",
    async (t) => {

        const organizerAgent =
            request.agent(app);

        const userAgent =
            request.agent(app);


        const organizerData = {
            first_name: "Organizer",
            last_name: "Validaciones",
            email:
                "organizer.validation@example.com",
            password: "Test12345"
        };


        const userData = {
            first_name: "Usuario",
            last_name: "Validaciones",
            email:
                "user.validation@example.com",
            password: "Test12345"
        };


        const organizer =
            await createOrganizerFixture(
                organizerData
            );


        await organizerAgent
            .post("/api/sessions/login")
            .send({
                email:
                    organizerData.email,
                password:
                    organizerData.password
            })
            .expect(200);


        await userAgent
            .post("/api/sessions/register")
            .send(userData)
            .expect(201);


        await userAgent
            .post("/api/sessions/login")
            .send({
                email:
                    userData.email,
                password:
                    userData.password
            })
            .expect(200);


        let eventId;


        await t.test(
            "campos internos enviados por cliente son ignorados",
            async () => {

                const fakeOrganizer =
                    new mongoose.Types.ObjectId();


                const response =
                    await organizerAgent
                        .post("/api/events")
                        .send({
                            title:
                                "Evento protegido",
                            description:
                                "Prueba de campos internos",
                            category:
                                "Test",
                            date:
                                new Date(
                                    Date.now() +
                                    86400000 * 30
                                ).toISOString(),
                            location:
                                "Mar del Plata",
                            capacity: 10,
                            price: 0,

                            status:
                                "published",

                            organizer:
                                fakeOrganizer.toString(),

                            reservationVersion:
                                999
                        })
                        .expect(201);


                eventId =
                    response.body.payload.id;


                const eventResponse =
                    await request(app)
                        .get(
                            `/api/events/${eventId}`
                        )
                        .expect(200);


                assert.equal(
                    eventResponse.body
                        .payload.status,
                    "draft"
                );


                assert.equal(
                    eventResponse.body
                        .payload.organizer,
                    organizer._id.toString()
                );


                assert.equal(
                    eventResponse.body
                        .payload
                        .reservationVersion,
                    undefined
                );
            }
        );


        await t.test(
            "campos internos tampoco pueden modificarse con PUT",
            async () => {

                const fakeOrganizer =
                    new mongoose.Types.ObjectId();


                await organizerAgent
                    .put(
                        `/api/events/${eventId}`
                    )
                    .send({
                        title:
                            "Evento protegido actualizado",

                        status:
                            "cancelled",

                        organizer:
                            fakeOrganizer.toString(),

                        reservationVersion:
                            999
                    })
                    .expect(200);


                const eventResponse =
                    await request(app)
                        .get(
                            `/api/events/${eventId}`
                        )
                        .expect(200);


                assert.equal(
                    eventResponse.body
                        .payload.title,
                    "Evento protegido actualizado"
                );


                assert.equal(
                    eventResponse.body
                        .payload.status,
                    "draft"
                );


                assert.equal(
                    eventResponse.body
                        .payload.organizer,
                    organizer._id.toString()
                );
            }
        );


        await t.test(
            "cambio de estado sin body devuelve 400",
            async () => {

                const response =
                    await organizerAgent
                        .patch(
                            `/api/events/${eventId}/status`
                        )
                        .expect(400);


                assert.equal(
                    response.body.status,
                    "error"
                );


                assert.equal(
                    response.body.message,
                    "El estado del evento no es válido"
                );
            }
        );


        await organizerAgent
            .patch(
                `/api/events/${eventId}/status`
            )
            .send({
                status: "published"
            })
            .expect(200);


        await t.test(
            "inscripción sin quantity devuelve 400",
            async () => {

                const response =
                    await userAgent
                        .post(
                            `/api/events/${eventId}/tickets`
                        )
                        .expect(400);


                assert.equal(
                    response.body.status,
                    "error"
                );


                assert.equal(
                    response.body.message,
                    "La cantidad debe ser un número entero mayor a 0"
                );
            }
        );
    }
);