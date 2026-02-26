import { Header } from "@/components/layout/Header";
import { prisma } from "@/lib/prisma";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Users, Plus, Phone, Mail } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/shared/EmptyState";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search = "" } = await searchParams;

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
      loans: { select: { id: true, status: true, principalAmount: true, outstandingBalance: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <Header
        title="Customers"
        subtitle={`${customers.length} registered customer(s)`}
        actions={
          <Link
            href="/customers/new"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Customer
          </Link>
        }
      />

      <div className="p-6">
        {/* Search */}
        <form method="GET" className="mb-5">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search by name, email, national ID or phone..."
            className="w-full max-w-md px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>

        {customers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No customers yet"
            description="Register your first customer to get started issuing loans."
            action={
              <Link href="/customers/new" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
                Register Customer
              </Link>
            }
          />
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Customer</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Contact</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">National ID</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Loans</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Outstanding</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Joined</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map((c) => {
                  const activeLoans = c.loans.filter((l) => l.status === "ACTIVE");
                  const totalOutstanding = activeLoans.reduce((sum, l) => sum + (l.outstandingBalance || 0), 0);
                  return (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-700 text-xs font-bold">
                              {c.firstName[0]}{c.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{c.firstName} {c.lastName}</p>
                            <p className="text-xs text-gray-500">{c.city}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-xs text-gray-600"><Mail className="w-3 h-3" />{c.email}</div>
                          <div className="flex items-center gap-1 text-xs text-gray-600"><Phone className="w-3 h-3" />{c.phone}</div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">{c.nationalId}</td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-medium text-gray-900">{c.loans.length}</span>
                        {activeLoans.length > 0 && (
                          <span className="ml-1 text-xs text-green-600">({activeLoans.length} active)</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-gray-900">
                        {totalOutstanding > 0 ? formatCurrency(totalOutstanding) : "—"}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">{formatDate(c.createdAt)}</td>
                      <td className="px-5 py-4">
                        <Link href={`/customers/${c.id}`} className="text-xs font-medium text-blue-600 hover:text-blue-700">
                          View →
                        </Link>
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
