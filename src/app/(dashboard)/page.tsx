import { Header } from "@/components/layout/Header";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { LoanStatusChart, MonthlyDisbursementsChart } from "@/components/dashboard/Charts";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, formatRelative } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Users,
  FileText,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import { subMonths, startOfMonth, endOfMonth } from "date-fns";

async function getDashboardData() {
  const now = new Date();

  const [totalCustomers, loanStats, collectionsThisMonth, overdueCount, recentLoans, recentPayments, monthlyDisbursements] =
    await Promise.all([
      prisma.customer.count(),
      prisma.loan.groupBy({ by: ["status"], _count: { status: true }, _sum: { principalAmount: true, outstandingBalance: true } }),
      prisma.payment.aggregate({ where: { paymentDate: { gte: startOfMonth(now), lte: endOfMonth(now) } }, _sum: { amount: true } }),
      prisma.amortizationEntry.count({ where: { isPaid: false, dueDate: { lt: now }, loan: { status: "ACTIVE" } } }),
      prisma.loan.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { customer: { select: { firstName: true, lastName: true } } } }),
      prisma.payment.findMany({ take: 5, orderBy: { paymentDate: "desc" }, include: { loan: { select: { loanNumber: true, customer: { select: { firstName: true, lastName: true } } } } } }),
      Promise.all(
        Array.from({ length: 6 }, (_, i) => {
          const month = subMonths(now, 5 - i);
          return prisma.loan.aggregate({ where: { disbursementDate: { gte: startOfMonth(month), lte: endOfMonth(month) }, status: { in: ["ACTIVE", "CLOSED"] } }, _sum: { principalAmount: true }, _count: true }).then((r) => ({ month: startOfMonth(month).toLocaleString("default", { month: "short", year: "2-digit" }), amount: r._sum.principalAmount || 0, count: r._count }));
        })
      ),
    ]);

  const totalDisbursed = loanStats.filter((s) => ["ACTIVE", "CLOSED"].includes(s.status)).reduce((sum, s) => sum + (s._sum.principalAmount || 0), 0);
  const activeLoans = loanStats.find((s) => s.status === "ACTIVE")?._count.status || 0;

  return {
    totalCustomers,
    totalDisbursed,
    activeLoans,
    overdueCount,
    collectionsThisMonth: collectionsThisMonth._sum.amount || 0,
    loanStatusBreakdown: loanStats.map((s) => ({ status: s.status, count: s._count.status })),
    recentLoans,
    recentPayments,
    monthlyDisbursements,
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div>
      <Header title="Dashboard" subtitle="Welcome back — here's your overview" />

      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <StatsCard title="Total Customers" value={data.totalCustomers.toString()} icon={Users} color="blue" />
          <StatsCard title="Active Loans" value={data.activeLoans.toString()} icon={FileText} color="green" />
          <StatsCard title="Total Disbursed" value={formatCurrency(data.totalDisbursed)} icon={TrendingUp} color="purple" subtitle="All time" />
          <StatsCard title="Collections (Month)" value={formatCurrency(data.collectionsThisMonth)} icon={CreditCard} color="green" />
          <StatsCard title="Overdue Payments" value={data.overdueCount.toString()} icon={AlertTriangle} color={data.overdueCount > 0 ? "red" : "green"} subtitle={data.overdueCount > 0 ? "Needs attention" : "All up to date"} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <LoanStatusChart data={data.loanStatusBreakdown} />
          <MonthlyDisbursementsChart data={data.monthlyDisbursements} />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Recent Loans */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Recent Loan Applications</h3>
              <Link href="/loans" className="text-xs text-blue-600 hover:text-blue-700 font-medium">View all</Link>
            </div>
            <div className="space-y-3">
              {data.recentLoans.length === 0 && (
                <p className="text-sm text-gray-400 py-4 text-center">No loans yet</p>
              )}
              {data.recentLoans.map((loan) => (
                <Link key={loan.id} href={`/loans/${loan.id}`} className="flex items-center justify-between py-2 hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{loan.loanNumber}</p>
                    <p className="text-xs text-gray-500">{loan.customer.firstName} {loan.customer.lastName}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={loan.status} />
                    <p className="text-xs text-gray-400 mt-1">{formatCurrency(loan.principalAmount)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Payments */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Recent Payments</h3>
              <Link href="/payments" className="text-xs text-blue-600 hover:text-blue-700 font-medium">View all</Link>
            </div>
            <div className="space-y-3">
              {data.recentPayments.length === 0 && (
                <p className="text-sm text-gray-400 py-4 text-center">No payments yet</p>
              )}
              {data.recentPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{payment.receiptNumber}</p>
                    <p className="text-xs text-gray-500">{payment.loan.customer.firstName} {payment.loan.customer.lastName} &bull; {payment.loan.loanNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">{formatCurrency(payment.amount)}</p>
                    <p className="text-xs text-gray-400">{formatDate(payment.paymentDate)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Overdue Warning */}
        {data.overdueCount > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm font-semibold text-red-800">{data.overdueCount} overdue payment(s) require attention</p>
                <p className="text-xs text-red-600">Send reminders to clients with overdue balances</p>
              </div>
            </div>
            <Link href="/debts" className="text-sm font-medium text-red-700 hover:text-red-800 bg-red-100 hover:bg-red-200 px-4 py-2 rounded-lg transition-colors">
              View Debts
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
