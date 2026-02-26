import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const loanId = formData.get("loanId") as string;
  const type = formData.get("type") as string;

  if (!file || !loanId || !type) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File size must not exceed 10MB" }, { status: 400 });
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, WebP and PDF files are allowed" },
      { status: 400 }
    );
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", loanId);
  await mkdir(uploadDir, { recursive: true });

  const ext = file.name.split(".").pop();
  const fileName = `${type}-${Date.now()}.${ext}`;
  const filePath = path.join(uploadDir, fileName);

  const bytes = await file.arrayBuffer();
  await writeFile(filePath, Buffer.from(bytes));

  const relativePath = `/uploads/${loanId}/${fileName}`;

  const document = await prisma.document.create({
    data: {
      loanId,
      type,
      fileName: file.name,
      filePath: relativePath,
      fileSize: file.size,
      mimeType: file.type,
      status: "PENDING",
    },
  });

  return NextResponse.json(document, { status: 201 });
}
