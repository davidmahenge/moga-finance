import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { subMonths, startOfMonth, endOfMonth } from "date-fns";

export async function GET() {
  const now = new Date();

  const [
    totalCustomers,
    loanStats,
    totalPaymentsThisMonth,
    overdueCount,
    recentLoans,
    recentPayments,
    monthlyDisbursements,
  ] = await Promise.all([
    prisma.customer.count(),

    prisma.loan.groupBy({
      by: ["status"],
      _count: { status: true },
      _sum: { principalAmount: true, outstandingBalance: true },
    }),

    prisma.payment.aggregate({
      where: {
        paymentDate: {
          gte: startOfMonth(now),
          lte: endOfMonth(now),
        },
      },
      _sum: { amount: true },
    }),

    prisma.amortizationEntry.count({
      where: {
        isPaid: false,
        dueDate: { lt: now },
        loan: { status: "ACTIVE" },
      },
    }),

    prisma.loan.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { firstName: true, lastName: true } },
      },
    }),

    prisma.payment.findMany({
      take: 5,
      orderBy: { paymentDate: "desc" },
      include: {
        loan: {
          select: {
            loanNumber: true,
            customer: { select: { firstName: true, lastName: true } },
          },
        },
      },
    }),

    // Monthly disbursements for last 6 months
    Promise.all(
      Array.from({ length: 6 }, (_, i) => {
        const month = subMonths(now, 5 - i);
        const start = startOfMonth(month);
        const end = endOfMonth(month);
        return prisma.loan
          .aggregate({
            where: {
              disbursementDate: { gte: start, lte: end },
              status: { in: ["ACTIVE", "CLOSED"] },
            },
            _sum: { principalAmount: true },
            _count: true,
          })
          .then((r) => ({
            month: start.toLocaleString("default", { month: "short", year: "2-digit" }),
            amount: r._sum.principalAmount || 0,
            count: r._count,
          }));
      })
    ),
  ]);

  const totalDisbursed = loanStats
    .filter((s) => ["ACTIVE", "CLOSED"].includes(s.status))
    .reduce((sum, s) => sum + (s._sum.principalAmount || 0), 0);

  const totalOutstanding = loanStats.reduce(
    (sum, s) => sum + (s._sum.outstandingBalance || 0),
    0
  );

  const activeLoans =
    loanStats.find((s) => s.status === "ACTIVE")?._count.status || 0;

  return NextResponse.json({
    totalCustomers,
    totalDisbursed,
    totalOutstanding,
    activeLoans,
    overdueCount,
    collectionsThisMonth: totalPaymentsThisMonth._sum.amount || 0,
    loanStatusBreakdown: loanStats.map((s) => ({
      status: s.status,
      count: s._count.status,
    })),
    recentLoans,
    recentPayments,
    monthlyDisbursements,
  });
}
