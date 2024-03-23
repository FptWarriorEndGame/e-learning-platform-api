import nodemailer, { Transporter, SendMailOptions } from "nodemailer";
interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  service: string;
  auth: {
    user: string;
    pass: string;
  };
}

const smtpConfig: SmtpConfig = {
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  service: "gmail",
  auth: {
    user: "nhatsang0101@gmail.com",
    pass: "qcyimnvfliayftgk",
  },
};

const transporter: Transporter = nodemailer.createTransport(smtpConfig);

async function sendEmail(options: SendMailOptions): Promise<void> {
  try {
    const info = await transporter.sendMail(options);
    console.log("Email sent: ", info.response);
  } catch (error) {
    console.error("Error when sending email: ", error);
  }
}

export default sendEmail;
