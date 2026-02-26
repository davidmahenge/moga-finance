import { Header } from "@/components/layout/Header";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CollateralManager } from "@/components/collateral/CollateralManager";
import Link from "next/link";

export default async function LoanCollateralPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const loan = await prisma.loan.findUnique({
    where: { id },
    include: {
      customer: { select: { firstName: true, lastName: true } },
      collaterals: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!loan) notFound();

  return (
    <div>
      <Header
        title="Collateral"
        subtitle={`${loan.loanNumber} — ${loan.customer.firstName} ${loan.customer.lastName}`}
        actions={
          <Link href={`/loans/${id}`} className="text-sm font-medium text-gray-600 hover:text-gray-800">
            ← Back to Loan
          </Link>
        }
      />

      <div className="p-6 max-w-3xl">
        <CollateralManager
          loanId={id}
          collaterals={loan.collaterals.map((c) => ({
            ...c,
            valuationDate: c.valuationDate.toISOString(),
            createdAt: c.createdAt.toISOString(),
            updatedAt: c.updatedAt.toISOString(),
            valuedBy: c.valuedBy ?? null,
            location: c.location ?? null,
            notes: c.notes ?? null,
          }))}
        />
      </div>
    </div>
  );
}
