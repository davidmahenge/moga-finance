import { Header } from "@/components/layout/Header";
import { prisma } from "@/lib/prisma";
import { formatDate, formatCurrency, PAYMENT_METHODS } from "@/lib/utils";
import { CreditCard, Plus } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/shared/EmptyState";

export default async function PaymentsPage() {
  const payments = await prisma.payment.findMany({
    include: {
      loan: {
        select: {
          loanNumber: true,
          customer: { select: { firstName: true, lastName: true } },
        },
      },
    },
    orderBy: { paymentDate: "desc" },
    take: 200,
  });

  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div>
      <Header
        title="Payments"
        subtitle={`${payments.length} payment(s) recorded`}
        actions={
          <Link href="/payments/record" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            Record Payment
          </Link>
        }
      />

      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Total Collected</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalCollected)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Payments Recorded</p>
            <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
          </div>
        </div>

        {payments.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No payments recorded"
            description="Record the first payment when a customer makes a repayment."
            action={
              <Link href="/payments/record" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
                Record Payment
              </Link>
            }
          />
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Receipt</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Customer</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Loan</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase px-5 py-3">Amount</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Method</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Date</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-mono text-sm font-medium text-gray-900">{p.receiptNumber}</td>
                    <td className="px-5 py-3 text-sm text-gray-900">
                      {p.loan.customer.firstName} {p.loan.customer.lastName}
                    </td>
                    <td className="px-5 py-3">
                      <Link href={`/loans/${p.loanId}`} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        {p.loan.loanNumber}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-right text-sm font-semibold text-green-600">{formatCurrency(p.amount)}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{PAYMENT_METHODS.find((m) => m.value === p.paymentMethod)?.label || p.paymentMethod}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{formatDate(p.paymentDate)}</td>
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
