import { transporter } from "../config/mail.config.js";
import dotenv from "dotenv";
dotenv.config();

export const sendWelcomeMail = async (email, username) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: `Welcome to our platform ${username}`,
      html: `<h1>Hello ${username},<h1>
            <h3>Welcome to our platform. We are glad to have you.</h3>
            <p>Thank you for joining us.</p>`,
    });

    console.log(`Message sent successfully: ${info.messageId}`);
  } catch (error) {
    console.log(`Error sending mail: ${error.message}`);
  }
};
