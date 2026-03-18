import { ENV } from '../config';

// servicios de email...

const EMAILJS_CONFIG = {
    SERVICE_ID: ENV.EMAILJS_SERVICE_ID, 
    TEMPLATE_ID_OTP: ENV.EMAILJS_TEMPLATE_ID,   
    TEMPLATE_ID_ADMIN: ENV.EMAILJS_TEMPLATE_ID, 
    PUBLIC_KEY: ENV.EMAILJS_PUBLIC_KEY, 
};

export const sendRealEmail = async (toEmail, subject, message, type = 'OTP') => {
    const templateId = type === 'ADMIN' ? EMAILJS_CONFIG.TEMPLATE_ID_ADMIN : EMAILJS_CONFIG.TEMPLATE_ID_OTP;

    const data = {
        service_id: EMAILJS_CONFIG.SERVICE_ID,
        template_id: templateId,
        user_id: EMAILJS_CONFIG.PUBLIC_KEY,
        template_params: {
            to_email: toEmail,
            subject: subject,
            message: message,
            // Puedes añadir más variables que coincidan con tu template en EmailJS
            // ej: {{otp_code}} en el diseño del mail
            otp_code: message // Asumiendo que el mensaje es el código para OTP
        }
    };

    try {
        console.log(`[EMAIL_REAL] Intentando enviar correo a ${toEmail} vía EmailJS...`);
        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'origin': 'http://localhost' // Truco para que EmailJS acepte la petición desde App
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            console.log('[EMAIL_REAL] ¡Correo enviado con éxito!');
            return true;
        } else {
            const text = await response.text();
            console.warn('[EMAIL_REAL] Fallo en el envío:', text);
            alert(`Error enviando correo: ${text}`); // Feedback visible para el usuario
            return false;
        }
    } catch (error) {
        console.error('[EMAIL_REAL] Error de red:', error);
        alert(`Error de conexión al enviar correo: ${error.message}`);
        return false;
    }
};
