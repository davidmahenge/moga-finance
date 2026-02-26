import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { customerSchema } from "@/lib/validations/customer.schema";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  const customers = await prisma.customer.findMany({
    where: search
      ? {
          OR: [
            { firstName: { contains: search } },
            { lastName: { contains: search } },
            { email: { contains: search } },
            { nationalId: { contains: search } },
            { phone: { contains: search } },
          ],
        }
      : {},
    include: {
      loans: { select: { id: true, status: true, principalAmount: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(customers);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = customerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  // Check for duplicate nationalId or email
  const existing = await prisma.customer.findFirst({
    where: {
      OR: [{ nationalId: data.nationalId }, { email: data.email }],
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "A customer with this National ID or Email already exists" },
      { status: 409 }
    );
  }

  const customer = await prisma.customer.create({
    data: {
      ...data,
      dateOfBirth: new Date(data.dateOfBirth),
    },
  });

  return NextResponse.json(customer, { status: 201 });
}
