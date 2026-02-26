import nodemailer from "nodemailer";
import { prisma } from "./prisma";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface EmailOptions {
  to: string;
  recipientName: string;
  subject: string;
  html: string;
  type: string;
  loanId?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "Moga Finance <noreply@mogafinance.co.tz>",
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    await prisma.alertLog.create({
      data: {
        loanId: options.loanId || null,
        recipientEmail: options.to,
        recipientName: options.recipientName,
        subject: options.subject,
        type: options.type,
        status: "SENT",
      },
    });

    return true;
  } catch (error) {
    await prisma.alertLog.create({
      data: {
        loanId: options.loanId || null,
        recipientEmail: options.to,
        recipientName: options.recipientName,
        subject: options.subject,
        type: options.type,
        status: "FAILED",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      },
    });
    return false;
  }
}
