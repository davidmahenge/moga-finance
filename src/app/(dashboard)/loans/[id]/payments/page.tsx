import { Header } from "@/components/layout/Header";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatDate, formatCurrency } from "@/lib/utils";
import { PAYMENT_METHODS } from "@/lib/utils";
import Link from "next/link";
import { CreditCard, Plus } from "lucide-react";

export default async function LoanPaymentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const loan = await prisma.loan.findUnique({
    where: { id },
    include: {
      customer: { select: { firstName: true, lastName: true } },
      payments: { orderBy: { paymentDate: "desc" } },
    },
  });

  if (!loan) notFound();

  const totalPaid = loan.payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div>
      <Header
        title="Payments"
        subtitle={`${loan.loanNumber} — ${loan.customer.firstName} ${loan.customer.lastName}`}
        actions={
          <div className="flex gap-2">
            {loan.status === "ACTIVE" && (
              <Link href={`/payments/record?loanId=${id}`} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                <Plus className="w-4 h-4" />
                Record Payment
              </Link>
            )}
            <Link href={`/loans/${id}`} className="text-sm font-medium text-gray-600 hover:text-gray-800 flex items-center">
              ← Back to Loan
            </Link>
          </div>
        }
      />

      <div className="p-6 max-w-4xl space-y-5">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Total Paid</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Outstanding</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(loan.outstandingBalance ?? loan.principalAmount)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Payments Made</p>
            <p className="text-xl font-bold text-gray-900">{loan.payments.length}</p>
          </div>
        </div>

        {loan.payments.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <CreditCard className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No payments recorded yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Receipt</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Date</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase px-5 py-3">Amount</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase px-5 py-3">Principal</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase px-5 py-3">Interest</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Method</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loan.payments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-mono text-sm font-medium text-gray-900">{p.receiptNumber}</td>
                    <td className="px-5 py-3 text-sm text-gray-700">{formatDate(p.paymentDate)}</td>
                    <td className="px-5 py-3 text-right text-sm font-semibold text-green-600">{formatCurrency(p.amount)}</td>
                    <td className="px-5 py-3 text-right text-sm text-gray-600">{formatCurrency(p.principalPortion)}</td>
                    <td className="px-5 py-3 text-right text-sm text-gray-600">{formatCurrency(p.interestPortion)}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{PAYMENT_METHODS.find((m) => m.value === p.paymentMethod)?.label || p.paymentMethod}</td>
                    <td className="px-5 py-3 text-sm text-gray-500">{p.referenceNumber || "—"}</td>
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
