import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { loanStatusSchema } from "@/lib/validations/loan.schema";
import { generateAmortizationSchedule } from "@/lib/loan-calculator";
import { sendEmail } from "@/lib/mailer";
import { loanApprovedEmail, loanRejectedEmail } from "@/lib/email-templates";
import { formatDate } from "@/lib/utils";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const parsed = loanStatusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { status, rejectionReason, approvedBy, disbursementDate } = parsed.data;

  const loan = await prisma.loan.findUnique({
    where: { id },
    include: { customer: true },
  });

  if (!loan) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updateData: Record<string, unknown> = { status };

  if (status === "APPROVED" || status === "ACTIVE") {
    const startDate = disbursementDate ? new Date(disbursementDate) : new Date();
    const maturityDate = new Date(startDate);
    maturityDate.setMonth(maturityDate.getMonth() + loan.termMonths);

    updateData.disbursementDate = startDate;
    updateData.maturityDate = maturityDate;
    updateData.approvedBy = approvedBy || "System";
    updateData.approvedAt = new Date();

    // Generate amortization schedule
    const schedule = generateAmortizationSchedule(
      loan.principalAmount,
      loan.interestRate,
      loan.termMonths,
      startDate
    );

    // Delete existing schedule if re-approving
    await prisma.amortizationEntry.deleteMany({ where: { loanId: id } });

    // Save schedule
    await prisma.amortizationEntry.createMany({
      data: schedule.map((row) => ({
        loanId: id,
        installmentNo: row.installmentNo,
        dueDate: row.dueDate,
        principalDue: row.principalDue,
        interestDue: row.interestDue,
        totalDue: row.totalDue,
        remainingBalance: row.remainingBalance,
      })),
    });

    // Send approval email
    if (loan.customer.email && loan.monthlyPayment) {
      const firstEntry = schedule[0];
      await sendEmail({
        to: loan.customer.email,
        recipientName: `${loan.customer.firstName} ${loan.customer.lastName}`,
        subject: `Loan Approved — ${loan.loanNumber}`,
        html: loanApprovedEmail(
          `${loan.customer.firstName} ${loan.customer.lastName}`,
          loan.loanNumber,
          loan.principalAmount,
          loan.termMonths,
          loan.monthlyPayment,
          formatDate(firstEntry.dueDate)
        ),
        type: "LOAN_APPROVED",
        loanId: id,
      });
    }
  }

  if (status === "REJECTED") {
    updateData.rejectionReason = rejectionReason || "No reason provided";

    if (loan.customer.email) {
      await sendEmail({
        to: loan.customer.email,
        recipientName: `${loan.customer.firstName} ${loan.customer.lastName}`,
        subject: `Loan Application Update — ${loan.loanNumber}`,
        html: loanRejectedEmail(
          `${loan.customer.firstName} ${loan.customer.lastName}`,
          loan.loanNumber,
          rejectionReason || "No specific reason provided"
        ),
        type: "LOAN_REJECTED",
        loanId: id,
      });
    }
  }

  const updated = await prisma.loan.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(updated);
}
