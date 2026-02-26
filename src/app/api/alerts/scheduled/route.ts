import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/mailer";
import { paymentDueEmail, paymentOverdueEmail } from "@/lib/email-templates";
import { formatDate } from "@/lib/utils";

// This endpoint can be called by a cron job daily
// Add CRON_SECRET env var and check it if you deploy to production
export async function POST() {
  const now = new Date();
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

  // Upcoming in 3 days
  const upcomingEntries = await prisma.amortizationEntry.findMany({
    where: {
      isPaid: false,
      dueDate: { gte: now, lte: threeDaysFromNow },
      loan: { status: "ACTIVE" },
    },
    include: {
      loan: { include: { customer: true } },
    },
  });

  // Overdue
  const overdueEntries = await prisma.amortizationEntry.findMany({
    where: {
      isPaid: false,
      dueDate: { lt: now },
      loan: { status: "ACTIVE" },
    },
    include: {
      loan: { include: { customer: true } },
    },
  });

  let sent = 0;
  let failed = 0;

  for (const entry of upcomingEntries) {
    const customer = entry.loan.customer;
    const daysUntilDue = Math.ceil(
      (entry.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    const customerName = `${customer.firstName} ${customer.lastName}`;

    const ok = await sendEmail({
      to: customer.email,
      recipientName: customerName,
      subject: `Payment Due in ${daysUntilDue} day(s) — ${entry.loan.loanNumber}`,
      html: paymentDueEmail(
        customerName,
        entry.loan.loanNumber,
        entry.totalDue,
        formatDate(entry.dueDate),
        daysUntilDue
      ),
      type: "PAYMENT_DUE",
      loanId: entry.loanId,
    });

    ok ? sent++ : failed++;
  }

  for (const entry of overdueEntries) {
    const customer = entry.loan.customer;
    const daysOverdue = Math.floor(
      (now.getTime() - entry.dueDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const customerName = `${customer.firstName} ${customer.lastName}`;

    const ok = await sendEmail({
      to: customer.email,
      recipientName: customerName,
      subject: `URGENT: Overdue Payment — ${entry.loan.loanNumber}`,
      html: paymentOverdueEmail(
        customerName,
        entry.loan.loanNumber,
        entry.totalDue,
        formatDate(entry.dueDate),
        daysOverdue
      ),
      type: "PAYMENT_OVERDUE",
      loanId: entry.loanId,
    });

    ok ? sent++ : failed++;
  }

  return NextResponse.json({
    sent,
    failed,
    total: upcomingEntries.length + overdueEntries.length,
  });
}
