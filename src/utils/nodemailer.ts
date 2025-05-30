import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  auth: {
    user: process.env.NODEMAIL_USER,
    pass: process.env.NODEMAIL_PASS,
  },
});

export const sendEmail = async (
  from: string,
  to: string,
  subject: string,
  html: string
) => {
  const mailOptions = {
    from,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
