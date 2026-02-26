import { Header } from "@/components/layout/Header";
import { PaymentForm } from "@/components/payments/PaymentForm";
import { prisma } from "@/lib/prisma";

export default async function RecordPaymentPage() {
  const loans = await prisma.loan.findMany({
    where: { status: "ACTIVE" },
    select: {
      id: true,
      loanNumber: true,
      outstandingBalance: true,
      customer: { select: { firstName: true, lastName: true } },
    },
    orderBy: { loanNumber: "asc" },
  });

  return (
    <div>
      <Header title="Record Payment" subtitle="Record a customer loan repayment" />
      <div className="p-6 max-w-2xl">
        <PaymentForm loans={loans} />
      </div>
    </div>
  );
}
