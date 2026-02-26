import { Header } from "@/components/layout/Header";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatDate, formatCurrency } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LoanActions } from "@/components/loans/LoanActions";
import { isPast } from "date-fns";
import Link from "next/link";
import { FileText, CreditCard, Archive } from "lucide-react";

export default async function LoanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const loan = await prisma.loan.findUnique({
    where: { id },
    include: {
      customer: true,
      amortization: { orderBy: { installmentNo: "asc" } },
      _count: { select: { documents: true, payments: true, collaterals: true } },
    },
  });

  if (!loan) notFound();

  const paidInstallments = loan.amortization.filter((e) => e.isPaid).length;
  const progress =
    loan.amortization.length > 0
      ? Math.round((paidInstallments / loan.amortization.length) * 100)
      : 0;

  return (
    <div>
      <Header
        title={loan.loanNumber}
        subtitle={`${loan.customer.firstName} ${loan.customer.lastName}`}
        actions={<LoanActions loanId={loan.id} status={loan.status} />}
      />

      <div className="p-6 space-y-5 max-w-6xl">
        {/* Summary Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard label="Principal" value={formatCurrency(loan.principalAmount)} />
          <SummaryCard label="Monthly Payment" value={loan.monthlyPayment ? formatCurrency(loan.monthlyPayment) : "—"} />
          <SummaryCard label="Outstanding Balance" value={loan.outstandingBalance != null ? formatCurrency(loan.outstandingBalance) : "—"} highlight />
          <SummaryCard label="Total Interest" value={loan.totalInterest ? formatCurrency(loan.totalInterest) : "—"} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Loan Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Loan Details</h3>
              <div className="grid grid-cols-2 gap-y-4">
                <InfoRow label="Status"><StatusBadge status={loan.status} /></InfoRow>
                <InfoRow label="Interest Rate">{loan.interestRate}% p.a.</InfoRow>
                <InfoRow label="Term">{loan.termMonths} months</InfoRow>
                <InfoRow label="Applied">{formatDate(loan.createdAt)}</InfoRow>
                {loan.disbursementDate && (
                  <InfoRow label="Disbursed">{formatDate(loan.disbursementDate)}</InfoRow>
                )}
                {loan.maturityDate && (
                  <InfoRow label="Maturity">{formatDate(loan.maturityDate)}</InfoRow>
                )}
                {loan.approvedBy && (
                  <InfoRow label="Approved By">{loan.approvedBy}</InfoRow>
                )}
                {loan.approvedAt && (
                  <InfoRow label="Approved On">{formatDate(loan.approvedAt)}</InfoRow>
                )}
              </div>

              {loan.purpose && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-1">Purpose</p>
                  <p className="text-sm text-gray-700">{loan.purpose}</p>
                </div>
              )}

              {loan.rejectionReason && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-xs font-medium text-red-600 mb-1">Rejection Reason</p>
                  <p className="text-sm text-red-700">{loan.rejectionReason}</p>
                </div>
              )}
            </div>

            {/* Amortization Schedule */}
            {loan.amortization.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-900">Repayment Schedule</h3>
                    <span className="text-xs text-gray-500">{paidInstallments}/{loan.amortization.length} paid</span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>
                <div className="overflow-x-auto max-h-72">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-gray-50">
                      <tr>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-2">#</th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-2">Due Date</th>
                        <th className="text-right text-xs font-semibold text-gray-500 uppercase px-5 py-2">Principal</th>
                        <th className="text-right text-xs font-semibold text-gray-500 uppercase px-5 py-2">Interest</th>
                        <th className="text-right text-xs font-semibold text-gray-500 uppercase px-5 py-2">Total</th>
                        <th className="text-right text-xs font-semibold text-gray-500 uppercase px-5 py-2">Balance</th>
                        <th className="text-center text-xs font-semibold text-gray-500 uppercase px-5 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {loan.amortization.map((entry) => {
                        const overdue = !entry.isPaid && isPast(new Date(entry.dueDate));
                        return (
                          <tr
                            key={entry.id}
                            className={`text-sm ${entry.isPaid ? "bg-green-50" : overdue ? "bg-red-50" : "hover:bg-gray-50"}`}
                          >
                            <td className="px-5 py-2.5 text-gray-500">{entry.installmentNo}</td>
                            <td className="px-5 py-2.5 text-gray-700">{formatDate(entry.dueDate)}</td>
                            <td className="px-5 py-2.5 text-right text-gray-700">{formatCurrency(entry.principalDue)}</td>
                            <td className="px-5 py-2.5 text-right text-gray-600">{formatCurrency(entry.interestDue)}</td>
                            <td className="px-5 py-2.5 text-right font-medium text-gray-900">{formatCurrency(entry.totalDue)}</td>
                            <td className="px-5 py-2.5 text-right text-gray-600">{formatCurrency(entry.remainingBalance)}</td>
                            <td className="px-5 py-2.5 text-center">
                              {entry.isPaid ? (
                                <span className="text-xs text-green-600 font-medium">✓ Paid</span>
                              ) : overdue ? (
                                <span className="text-xs text-red-600 font-medium">Overdue</span>
                              ) : (
                                <span className="text-xs text-gray-400">Pending</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Customer Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Customer</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-700 text-sm font-bold">
                    {loan.customer.firstName[0]}{loan.customer.lastName[0]}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {loan.customer.firstName} {loan.customer.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{loan.customer.email}</p>
                </div>
              </div>
              <Link href={`/customers/${loan.customer.id}`} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                View profile →
              </Link>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Sections</h3>
              <div className="space-y-2">
                <Link href={`/loans/${loan.id}/documents`} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">Documents</span>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{loan._count.documents}</span>
                </Link>
                <Link href={`/loans/${loan.id}/payments`} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">Payments</span>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{loan._count.payments}</span>
                </Link>
                <Link href={`/loans/${loan.id}/collateral`} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <Archive className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">Collateral</span>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{loan._count.collaterals}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"}`}>
      <p className={`text-xs font-medium mb-1 ${highlight ? "text-blue-600" : "text-gray-500"}`}>{label}</p>
      <p className={`text-lg font-bold ${highlight ? "text-blue-800" : "text-gray-900"}`}>{value}</p>
    </div>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <div className="text-sm text-gray-700 font-medium">{children}</div>
    </div>
  );
}
