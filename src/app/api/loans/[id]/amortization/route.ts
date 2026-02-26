import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const entries = await prisma.amortizationEntry.findMany({
    where: { loanId: id },
    orderBy: { installmentNo: "asc" },
  });
  return NextResponse.json(entries);
}
