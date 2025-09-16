import nodemailer from "nodemailer";

export const sendAssistanceMail = async ({ name, age, email, message }) => {
  try {
    // Configure Gmail SMTP
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,  //  gmail address
        pass: process.env.GMAIL_PASS   // app password
      },
    });

    // Format the email
    let mailOptions = {
      from: `"PACE Assistance" <${process.env.GMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL || process.env.GMAIL_USER, // sending to myself
      subject: `New Assistance Request from ${name}`,
      text: `
        Name: ${name}
        Age: ${age}
        Email: ${email}
        Message: ${message}
      `,
      html: `
        <h2>Need Assistance Request</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Age:</b> ${age}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Message:</b> ${message}</p>
      `
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    return { success: true, message: "Email sent successfully!" };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, message: "Failed to send email." };
  }
};
