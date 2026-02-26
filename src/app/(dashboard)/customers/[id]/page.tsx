import { Header } from "@/components/layout/Header";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatDate, formatCurrency } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Phone, Mail, MapPin, Briefcase, Edit, Plus } from "lucide-react";
import Link from "next/link";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      loans: {
        include: { payments: { select: { amount: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!customer) notFound();

  const fullName = `${customer.firstName} ${customer.lastName}`;

  return (
    <div>
      <Header
        title={fullName}
        subtitle={`National ID: ${customer.nationalId}`}
        actions={
          <div className="flex gap-2">
            <Link
              href={`/loans/new?customerId=${customer.id}`}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Loan
            </Link>
            <Link
              href={`/customers/${customer.id}/edit`}
              className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Link>
          </div>
        }
      />

      <div className="p-6 space-y-5 max-w-5xl">
        {/* Profile Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 md:col-span-2">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="text-blue-700 font-bold text-xl">
                  {customer.firstName[0]}{customer.lastName[0]}
                </span>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-4">
                <InfoItem icon={Mail} label="Email" value={customer.email} />
                <InfoItem icon={Phone} label="Phone" value={customer.phone} />
                <InfoItem icon={MapPin} label="Address" value={`${customer.address}, ${customer.city}`} />
                <InfoItem icon={Briefcase} label="Employment" value={customer.employmentStatus.replace("_", " ")} />
                {customer.employerName && (
                  <InfoItem label="Employer" value={customer.employerName} />
                )}
                {customer.monthlyIncome && (
                  <InfoItem label="Monthly Income" value={formatCurrency(customer.monthlyIncome)} />
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <div>
              <p className="text-xs text-gray-400">Total Loans</p>
              <p className="text-2xl font-bold text-gray-900">{customer.loans.length}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Active Loans</p>
              <p className="text-2xl font-bold text-green-600">
                {customer.loans.filter((l) => l.status === "ACTIVE").length}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Total Outstanding</p>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(
                  customer.loans
                    .filter((l) => l.status === "ACTIVE")
                    .reduce((sum, l) => sum + (l.outstandingBalance || 0), 0)
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Customer Since</p>
              <p className="text-sm font-medium text-gray-700">{formatDate(customer.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Loans Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Loan History</h3>
          </div>
          {customer.loans.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-gray-400">No loans for this customer yet</p>
              <Link href={`/loans/new?customerId=${customer.id}`} className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-block font-medium">
                Issue first loan →
              </Link>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Loan No.</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Amount</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Outstanding</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Date</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customer.loans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 text-sm font-mono font-medium text-gray-900">{loan.loanNumber}</td>
                    <td className="px-5 py-4 text-sm text-gray-900">{formatCurrency(loan.principalAmount)}</td>
                    <td className="px-5 py-4"><StatusBadge status={loan.status} /></td>
                    <td className="px-5 py-4 text-sm text-gray-700">
                      {loan.outstandingBalance != null ? formatCurrency(loan.outstandingBalance) : "—"}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">{formatDate(loan.createdAt)}</td>
                    <td className="px-5 py-4">
                      <Link href={`/loans/${loan.id}`} className="text-xs font-medium text-blue-600 hover:text-blue-700">View →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon?: React.ElementType; label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <div className="flex items-center gap-1">
        {Icon && <Icon className="w-3.5 h-3.5 text-gray-400" />}
        <p className="text-sm text-gray-700">{value}</p>
      </div>
    </div>
  );
}
