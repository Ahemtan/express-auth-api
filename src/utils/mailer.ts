import nodemailer, { SendMailOptions } from "nodemailer";
import log from "./logger";

async function createTestCreds() {
  const creds = await nodemailer.createTestAccount();
  console.log({ creds });
}

// createTestCreds();

const transpoter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_HOST),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const google_transpoter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.gmail_email,
    pass: process.env.gmail_pass,
  },
});

async function sendEmail(payload: SendMailOptions) {
  google_transpoter.sendMail(payload, (err, info) => {
    if (err) {
      log.error(err, "Error sending email");
    }
  });
}

export default sendEmail;
