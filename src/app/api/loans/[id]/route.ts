import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const loan = await prisma.loan.findUnique({
    where: { id },
    include: {
      customer: true,
      documents: { orderBy: { uploadedAt: "desc" } },
      payments: { orderBy: { paymentDate: "desc" } },
      collaterals: { orderBy: { createdAt: "desc" } },
      amortization: { orderBy: { installmentNo: "asc" } },
    },
  });

  if (!loan) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(loan);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const loan = await prisma.loan.update({ where: { id }, data: body });
  return NextResponse.json(loan);
}
