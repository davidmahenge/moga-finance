import { Header } from "@/components/layout/Header";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { DocumentUpload } from "@/components/documents/DocumentUpload";
import { DocumentList } from "@/components/documents/DocumentList";
import Link from "next/link";

export default async function LoanDocumentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const loan = await prisma.loan.findUnique({
    where: { id },
    include: {
      customer: { select: { firstName: true, lastName: true } },
      documents: { orderBy: { uploadedAt: "desc" } },
    },
  });

  if (!loan) notFound();

  return (
    <div>
      <Header
        title="Documents"
        subtitle={`${loan.loanNumber} — ${loan.customer.firstName} ${loan.customer.lastName}`}
        actions={
          <Link href={`/loans/${id}`} className="text-sm font-medium text-gray-600 hover:text-gray-800">
            ← Back to Loan
          </Link>
        }
      />

      <div className="p-6 max-w-3xl space-y-5">
        <DocumentUpload loanId={id} />

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Uploaded Documents ({loan.documents.length})
          </h3>
          <DocumentList documents={loan.documents.map((d) => ({ ...d, verifiedAt: d.verifiedAt?.toISOString() || null, uploadedAt: d.uploadedAt.toISOString() }))} />
        </div>
      </div>
    </div>
  );
}
