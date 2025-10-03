const nodemailer = require("nodemailer");
require("dotenv").config();

const sendMail = async (to, subject, text) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: `"Remoto Onboard" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("📧 Email đã được gửi đến", to);
    } catch (error) {
        console.error("❌ Lỗi gửi email:", error);
    }
};

module.exports = sendMail;
