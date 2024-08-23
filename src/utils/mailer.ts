import nodemailer, { SendMailOptions } from "nodemailer";
import log from "./logger";

// UNCOMMENT BELOW CODE TO GET TEST SMTP
// async function createTestCreds() {
//     const creds = await nodemailer.createTestAccount();
//     console.log({ creds });
// }

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

async function sendEmail(payload: SendMailOptions) {
  transpoter.sendMail(payload, (err, info) => {
    if (err) {
      log.error(err, "Error sending email");
    }

    log.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
  });
}

export default sendEmail;
