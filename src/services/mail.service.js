import { transporter } from "../config/mailer.config.js";
import { config } from "../config/config.js";


export const sendTicketConfirmationEmail = async ({
    to,
    userName,
    eventTitle,
    reservationCode
}) => {
    await transporter.sendMail({
        from: config.mailFrom,
        to,
        subject: "Confirmación de inscripción",
        html: `
            <h1>Inscripción confirmada</h1>

            <p>
                Hola ${userName},
                tu inscripción al evento
                <strong>${eventTitle}</strong>
                fue confirmada correctamente.
            </p>

            <p>
                Código de reserva:
                <strong>${reservationCode}</strong>
            </p>
        `
    });
};