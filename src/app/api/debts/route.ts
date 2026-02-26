import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "overdue";
  const days = parseInt(searchParams.get("days") || "30");

  const now = new Date();
  const future = new Date();
  future.setDate(future.getDate() + days);

  const where =
    type === "overdue"
      ? { dueDate: { lt: now }, isPaid: false }
      : { dueDate: { gte: now, lte: future }, isPaid: false };

  const entries = await prisma.amortizationEntry.findMany({
    where: {
      ...where,
      loan: { status: "ACTIVE" },
    },
    include: {
      loan: {
        select: {
          id: true,
          loanNumber: true,
          status: true,
          customer: { select: { firstName: true, lastName: true, email: true, phone: true } },
        },
      },
    },
    orderBy: { dueDate: "asc" },
  });

  return NextResponse.json(entries);
}
