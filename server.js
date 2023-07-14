const express = require("express");
const nodemailer = require("nodemailer");
require("dotenv").config();
const cors = require("cors");

const app = express();
const port = process.env.SERVER_PORT || 3000;

app.use(
    cors({
        origin: ["http://127.0.0.1:5500"],
    })
);
app.use(express.json());

app.post("/send-email", (req, res) => {
    const { name, email, message } = req.body;

    // Create a transporter using SMTP configuration
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    // Prepare the email content
    const mailOptions = {
        from: `"${name}" <${email}>`,
        to: process.env.SMTP_USER,
        replyTo: email, // Set the reply-to email as the user-entered email
        subject: "New message from your website",
        text: `From: ${name} \nEmail:<${email}>\n\nMessage:${message}`, // Include the user-entered name and email in the message body
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Error sending email:", error);
            res.status(500).json({
                error: "An error occurred while sending the email",
            });
        } else {
            console.log("Email sent:", info.response);
            res.json({ message: "Email sent successfully" });
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
