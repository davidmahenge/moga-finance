import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { collateralSchema } from "@/lib/validations/collateral.schema";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const loanId = searchParams.get("loanId");

  const collaterals = await prisma.collateral.findMany({
    where: loanId ? { loanId } : {},
    include: {
      loan: { select: { loanNumber: true, customer: { select: { firstName: true, lastName: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(collaterals);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = collateralSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const collateral = await prisma.collateral.create({
    data: {
      ...parsed.data,
      valuationDate: new Date(parsed.data.valuationDate),
    },
  });

  return NextResponse.json(collateral, { status: 201 });
}
