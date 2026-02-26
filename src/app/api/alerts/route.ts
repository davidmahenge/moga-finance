import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "50");

  const alerts = await prisma.alertLog.findMany({
    include: {
      loan: { select: { loanNumber: true } },
    },
    orderBy: { sentAt: "desc" },
    take: limit,
  });

  return NextResponse.json(alerts);
}
