import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/mailer";
import {
  paymentDueEmail,
  paymentOverdueEmail,
} from "@/lib/email-templates";
import { formatDate } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const { loanId, type } = await req.json();

  const loan = await prisma.loan.findUnique({
    where: { id: loanId },
    include: {
      customer: true,
      amortization: {
        where: { isPaid: false },
        orderBy: { installmentNo: "asc" },
        take: 1,
      },
    },
  });

  if (!loan) return NextResponse.json({ error: "Loan not found" }, { status: 404 });

  const nextEntry = loan.amortization[0];
  if (!nextEntry) {
    return NextResponse.json({ error: "No upcoming payments found" }, { status: 400 });
  }

  const now = new Date();
  const dueDate = new Date(nextEntry.dueDate);
  const diffMs = dueDate.getTime() - now.getTime();
  const daysUntilDue = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const daysOverdue = Math.abs(Math.floor(diffMs / (1000 * 60 * 60 * 24)));

  const customerName = `${loan.customer.firstName} ${loan.customer.lastName}`;

  let html: string;
  let subject: string;
  let alertType: string;

  if (type === "PAYMENT_DUE" || daysUntilDue > 0) {
    html = paymentDueEmail(
      customerName,
      loan.loanNumber,
      nextEntry.totalDue,
      formatDate(dueDate),
      daysUntilDue
    );
    subject = `Payment Due Reminder — ${loan.loanNumber}`;
    alertType = "PAYMENT_DUE";
  } else {
    html = paymentOverdueEmail(
      customerName,
      loan.loanNumber,
      nextEntry.totalDue,
      formatDate(dueDate),
      daysOverdue
    );
    subject = `URGENT: Overdue Payment — ${loan.loanNumber}`;
    alertType = "PAYMENT_OVERDUE";
  }

  const success = await sendEmail({
    to: loan.customer.email,
    recipientName: customerName,
    subject,
    html,
    type: alertType,
    loanId,
  });

  return NextResponse.json({ success });
}
