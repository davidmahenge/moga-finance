import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { collateralSchema } from "@/lib/validations/collateral.schema";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const parsed = collateralSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const collateral = await prisma.collateral.update({
    where: { id },
    data: {
      ...parsed.data,
      valuationDate: new Date(parsed.data.valuationDate),
    },
  });

  return NextResponse.json(collateral);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.collateral.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
