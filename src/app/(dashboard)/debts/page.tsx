import { Header } from "@/components/layout/Header";
import { prisma } from "@/lib/prisma";
import { formatDate, formatCurrency } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { DebtAlertButton } from "@/components/debts/DebtAlertButton";

export default async function DebtsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; days?: string }>;
}) {
  const { tab = "overdue", days = "30" } = await searchParams;
  const now = new Date();
  const future = new Date();
  future.setDate(future.getDate() + parseInt(days));

  const overdueEntries = await prisma.amortizationEntry.findMany({
    where: { isPaid: false, dueDate: { lt: now }, loan: { status: "ACTIVE" } },
    include: { loan: { select: { id: true, loanNumber: true, customer: { select: { firstName: true, lastName: true, email: true, phone: true } } } } },
    orderBy: { dueDate: "asc" },
  });

  const upcomingEntries = await prisma.amortizationEntry.findMany({
    where: { isPaid: false, dueDate: { gte: now, lte: future }, loan: { status: "ACTIVE" } },
    include: { loan: { select: { id: true, loanNumber: true, customer: { select: { firstName: true, lastName: true, email: true, phone: true } } } } },
    orderBy: { dueDate: "asc" },
  });

  const entries = tab === "overdue" ? overdueEntries : upcomingEntries;
  const totalOverdueAmount = overdueEntries.reduce((sum, e) => sum + e.totalDue, 0);

  return (
    <div>
      <Header
        title="Due Debts"
        subtitle={`${overdueEntries.length} overdue, ${upcomingEntries.length} upcoming`}
      />

      <div className="p-6">
        {/* Warning Banner */}
        {overdueEntries.length > 0 && (
          <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-800">
                {overdueEntries.length} overdue payment(s) totalling {formatCurrency(totalOverdueAmount)}
              </p>
              <p className="text-xs text-red-600">Send reminders to notify clients immediately.</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-lg w-fit">
          <Link
            href="/debts?tab=overdue"
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors ${tab === "overdue" || !tab ? "bg-white text-red-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Overdue ({overdueEntries.length})
          </Link>
          <Link
            href={`/debts?tab=upcoming&days=${days}`}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors ${tab === "upcoming" ? "bg-white text-amber-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Upcoming ({upcomingEntries.length})
          </Link>
        </div>

        {tab === "upcoming" && (
          <div className="flex gap-2 mb-4">
            {[7, 14, 30].map((d) => (
              <Link key={d} href={`/debts?tab=upcoming&days=${d}`} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${days === String(d) ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`}>
                {d} days
              </Link>
            ))}
          </div>
        )}

        {entries.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-green-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900 mb-1">All clear!</p>
            <p className="text-sm text-gray-500">
              {tab === "overdue" ? "No overdue payments at this time." : `No payments due in the next ${days} days.`}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Customer</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Loan</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Installment</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase px-5 py-3">Amount Due</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Due Date</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">
                    {tab === "overdue" ? "Days Overdue" : "Days Until Due"}
                  </th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {entries.map((entry) => {
                  const diffMs = new Date(entry.dueDate).getTime() - now.getTime();
                  const diffDays = Math.abs(Math.floor(diffMs / (1000 * 60 * 60 * 24)));
                  const isOverdue = tab === "overdue";

                  return (
                    <tr key={entry.id} className={`hover:bg-gray-50 ${isOverdue ? "bg-red-50/30" : ""}`}>
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-gray-900">
                          {entry.loan.customer.firstName} {entry.loan.customer.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{entry.loan.customer.phone}</p>
                      </td>
                      <td className="px-5 py-4">
                        <Link href={`/loans/${entry.loan.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-700">
                          {entry.loan.loanNumber}
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">#{entry.installmentNo}</td>
                      <td className="px-5 py-4 text-right text-sm font-semibold text-gray-900">{formatCurrency(entry.totalDue)}</td>
                      <td className="px-5 py-4 text-sm text-gray-700">{formatDate(entry.dueDate)}</td>
                      <td className="px-5 py-4">
                        <span className={`text-sm font-semibold ${isOverdue ? "text-red-600" : diffDays <= 7 ? "text-amber-600" : "text-gray-600"}`}>
                          {diffDays} day{diffDays !== 1 ? "s" : ""}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <DebtAlertButton loanId={entry.loan.id} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
