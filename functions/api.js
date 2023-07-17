const express = require("express");
const serverless = require("serverless-http");
const nodemailer = require("nodemailer");
require("dotenv").config();
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const app = express();
const router = express.Router();

// Limit requests from the same IP
const limiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 10, // Maximum requests per windowMs
});

app.use(limiter);

app.use(
    cors({
        origin: ["https://markuss-portfolio.netlify.app"],
    })
);
app.use(express.json());

router.post("/send-email", (req, res) => {
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
        replyTo: email,
        subject: "New message from your website",
        text: `From: ${name} \nEmail:<${email}>\n\nMessage:${message}`,
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

app.use(`/.netlify/functions/api`, router);

module.exports = app;
module.exports.handler = serverless(app);
