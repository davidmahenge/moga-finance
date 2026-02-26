import { Header } from "@/components/layout/Header";
import { prisma } from "@/lib/prisma";
import { formatDate, formatCurrency } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { FileText, Plus } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/shared/EmptyState";

const STATUSES = ["ALL", "PENDING", "UNDER_REVIEW", "APPROVED", "ACTIVE", "CLOSED", "REJECTED", "DEFAULTED"];

export default async function LoansPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = "ALL" } = await searchParams;

  const loans = await prisma.loan.findMany({
    where: status !== "ALL" ? { status } : {},
    include: {
      customer: { select: { firstName: true, lastName: true, phone: true } },
      _count: { select: { payments: true, documents: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <Header
        title="Loans"
        subtitle={`${loans.length} loan(s)`}
        actions={
          <Link
            href="/loans/new"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Application
          </Link>
        }
      />

      <div className="p-6">
        {/* Status Tabs */}
        <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-lg w-fit overflow-x-auto">
          {STATUSES.map((s) => (
            <Link
              key={s}
              href={`/loans${s !== "ALL" ? `?status=${s}` : ""}`}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                status === s || (s === "ALL" && !status)
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {s.replace("_", " ")}
            </Link>
          ))}
        </div>

        {loans.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No loans found"
            description="No loan applications match the selected filter."
            action={
              <Link href="/loans/new" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
                New Application
              </Link>
            }
          />
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Loan No.</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Customer</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Amount</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Term</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Monthly</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Outstanding</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Date</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-mono text-sm font-medium text-gray-900">{loan.loanNumber}</td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-gray-900">{loan.customer.firstName} {loan.customer.lastName}</p>
                      <p className="text-xs text-gray-500">{loan.customer.phone}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-900">{formatCurrency(loan.principalAmount)}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{loan.termMonths}mo</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{loan.monthlyPayment ? formatCurrency(loan.monthlyPayment) : "—"}</td>
                    <td className="px-5 py-4 text-sm font-medium text-gray-900">
                      {loan.outstandingBalance != null ? formatCurrency(loan.outstandingBalance) : "—"}
                    </td>
                    <td className="px-5 py-4"><StatusBadge status={loan.status} /></td>
                    <td className="px-5 py-4 text-sm text-gray-500">{formatDate(loan.createdAt)}</td>
                    <td className="px-5 py-4">
                      <Link href={`/loans/${loan.id}`} className="text-xs font-medium text-blue-600 hover:text-blue-700">View →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
