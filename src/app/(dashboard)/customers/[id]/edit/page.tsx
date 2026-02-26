import { Header } from "@/components/layout/Header";
import { CustomerForm } from "@/components/customers/CustomerForm";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { format } from "date-fns";

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) notFound();

  return (
    <div>
      <Header title="Edit Customer" subtitle={`${customer.firstName} ${customer.lastName}`} />
      <div className="p-6 max-w-3xl">
        <CustomerForm
          customerId={id}
          defaultValues={{
            ...customer,
            dateOfBirth: format(customer.dateOfBirth, "yyyy-MM-dd"),
            monthlyIncome: customer.monthlyIncome ?? undefined,
            employerName: customer.employerName ?? undefined,
            employmentStatus: customer.employmentStatus as "EMPLOYED" | "SELF_EMPLOYED" | "UNEMPLOYED" | "RETIRED",
          }}
        />
      </div>
    </div>
  );
}
