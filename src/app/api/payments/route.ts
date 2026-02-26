import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { paymentSchema } from "@/lib/validations/payment.schema";
import { generateReceiptNumber } from "@/lib/utils";
import { sendEmail } from "@/lib/mailer";
import { paymentReceivedEmail } from "@/lib/email-templates";
import { formatDate } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const loanId = searchParams.get("loanId");

  const payments = await prisma.payment.findMany({
    where: loanId ? { loanId } : {},
    include: {
      loan: {
        select: {
          loanNumber: true,
          customer: { select: { firstName: true, lastName: true, email: true } },
        },
      },
    },
    orderBy: { paymentDate: "desc" },
  });

  return NextResponse.json(payments);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = paymentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  const loan = await prisma.loan.findUnique({
    where: { id: data.loanId },
    include: {
      customer: true,
      amortization: {
        where: { isPaid: false },
        orderBy: { installmentNo: "asc" },
      },
    },
  });

  if (!loan) return NextResponse.json({ error: "Loan not found" }, { status: 404 });
  if (loan.status !== "ACTIVE") {
    return NextResponse.json({ error: "Loan is not active" }, { status: 400 });
  }

  const outstanding = loan.outstandingBalance ?? loan.principalAmount;
  if (data.amount > outstanding + 1) {
    return NextResponse.json(
      { error: `Amount exceeds outstanding balance of ${outstanding}` },
      { status: 400 }
    );
  }

  // Determine principal and interest split from next unpaid installment
  const nextInstallment = loan.amortization[0];
  let principalPortion = data.amount;
  let interestPortion = 0;

  if (nextInstallment) {
    interestPortion = Math.min(nextInstallment.interestDue, data.amount);
    principalPortion = Math.max(0, data.amount - interestPortion);
  }

  const receiptNumber = await generateReceiptNumber(prisma);
  const newBalance = Math.max(0, outstanding - principalPortion);

  const payment = await prisma.$transaction(async (tx) => {
    const p = await tx.payment.create({
      data: {
        loanId: data.loanId,
        receiptNumber,
        amount: data.amount,
        principalPortion,
        interestPortion,
        paymentDate: new Date(data.paymentDate),
        paymentMethod: data.paymentMethod,
        referenceNumber: data.referenceNumber,
        notes: data.notes,
      },
    });

    // Mark installments as paid
    if (nextInstallment) {
      await tx.amortizationEntry.update({
        where: { id: nextInstallment.id },
        data: { isPaid: true, paidAt: new Date(data.paymentDate) },
      });
    }

    // Update outstanding balance
    await tx.loan.update({
      where: { id: data.loanId },
      data: {
        outstandingBalance: newBalance,
        status: newBalance <= 0 ? "CLOSED" : "ACTIVE",
      },
    });

    return p;
  });

  // Send email confirmation
  if (loan.customer.email) {
    await sendEmail({
      to: loan.customer.email,
      recipientName: `${loan.customer.firstName} ${loan.customer.lastName}`,
      subject: `Payment Received — ${receiptNumber}`,
      html: paymentReceivedEmail(
        `${loan.customer.firstName} ${loan.customer.lastName}`,
        receiptNumber,
        data.amount,
        formatDate(data.paymentDate),
        newBalance
      ),
      type: "PAYMENT_RECEIVED",
      loanId: data.loanId,
    });
  }

  return NextResponse.json(payment, { status: 201 });
}
