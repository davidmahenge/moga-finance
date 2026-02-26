import { Header } from "@/components/layout/Header";
import { LoanApplicationForm } from "@/components/loans/LoanApplicationForm";
import { prisma } from "@/lib/prisma";

export default async function NewLoanPage() {
  const customers = await prisma.customer.findMany({
    select: { id: true, firstName: true, lastName: true, nationalId: true },
    orderBy: { firstName: "asc" },
  });

  return (
    <div>
      <Header title="New Loan Application" subtitle="Submit a loan application for a customer" />
      <div className="p-6 max-w-3xl">
        <LoanApplicationForm customers={customers} />
      </div>
    </div>
  );
}
