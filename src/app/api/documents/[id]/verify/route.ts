import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { action, rejectionNote, verifiedBy } = await req.json();

  if (!["VERIFIED", "REJECTED"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const document = await prisma.document.update({
    where: { id },
    data: {
      status: action,
      verifiedBy: verifiedBy || "System",
      verifiedAt: new Date(),
      rejectionNote: action === "REJECTED" ? rejectionNote : null,
    },
  });

  return NextResponse.json(document);
}
