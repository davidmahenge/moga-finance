import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { loanSchema } from "@/lib/validations/loan.schema";
import { calculateMonthlyPayment, calculateTotalInterest } from "@/lib/loan-calculator";
import { generateLoanNumber as genLoanNum } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const customerId = searchParams.get("customerId");

  const loans = await prisma.loan.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(customerId ? { customerId } : {}),
    },
    include: {
      customer: { select: { firstName: true, lastName: true, email: true, phone: true } },
      payments: { select: { amount: true } },
      _count: { select: { documents: true, collaterals: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(loans);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = loanSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const loanNumber = await genLoanNum(prisma);
  const monthlyPayment = calculateMonthlyPayment(
    data.principalAmount,
    data.interestRate,
    data.termMonths
  );
  const totalInterest = calculateTotalInterest(
    data.principalAmount,
    data.interestRate,
    data.termMonths
  );

  const loan = await prisma.loan.create({
    data: {
      loanNumber,
      customerId: data.customerId,
      principalAmount: data.principalAmount,
      interestRate: data.interestRate,
      termMonths: data.termMonths,
      purpose: data.purpose,
      notes: data.notes,
      monthlyPayment,
      totalInterest,
      outstandingBalance: data.principalAmount,
      status: "PENDING",
    },
  });

  return NextResponse.json(loan, { status: 201 });
}
