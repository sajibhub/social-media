import nodemailer from "nodemailer";
export const Mail = async (email, subject, html) => {
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT, 10),
    secure: process.env.MAIL_SECURE === "true",
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: `MATRIX ${process.env.MAIL_USERNAME}`,
    to: email,
    subject: subject,
    html: html,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};
