import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.post("/send-assistance", async (req, res) => {
  const { name, age, email, message } = req.body;

  if (!name || !age || !email || !message) {
    return res.status(400).json({ ok: false, error: "All fields are required" });
  }

  try {
    // ✅ Gmail Transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER, 
        pass: process.env.GMAIL_PASS, // Gmail App Password
      },
    });

    // ✅ Mail Content
    const mailOptions = {
      from: `"PACE Assistance" <${process.env.GMAIL_USER}>`,
      to: process.env.RECEIVER_EMAIL || process.env.GMAIL_USER,
      subject: "New Assistance Request",
      text: `
      📩 New Assistance Request
      
      Name: ${name}
      Age: ${age}
      Email: ${email}
      Message: ${message}
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ ok: true, message: "Query sent successfully!" });
  } catch (err) {
    console.error("❌ Email error:", err);
    res.status(500).json({ ok: false, error: "Failed to send email" });
  }
});

export default router;
