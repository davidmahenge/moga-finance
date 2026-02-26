"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { paymentSchema, PaymentFormData } from "@/lib/validations/payment.schema";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { PAYMENT_METHODS, formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

interface Loan {
  id: string;
  loanNumber: string;
  outstandingBalance: number | null;
  customer: { firstName: string; lastName: string };
}

export function PaymentForm({ loans }: { loans: Loan[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedLoan = searchParams.get("loanId") || "";
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      loanId: preselectedLoan,
      paymentDate: format(new Date(), "yyyy-MM-dd"),
      paymentMethod: "CASH",
    },
  });

  const selectedLoanId = watch("loanId");
  const selectedLoan = loans.find((l) => l.id === selectedLoanId);

  async function onSubmit(data: PaymentFormData) {
    setError("");
    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json();
      setError(typeof body.error === "string" ? body.error : "Failed to record payment");
      return;
    }

    router.push("/payments");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Payment Details</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Loan</label>
          <select {...register("loanId")} className="input">
            <option value="">Select loan...</option>
            {loans.map((l) => (
              <option key={l.id} value={l.id}>
                {l.loanNumber} — {l.customer.firstName} {l.customer.lastName}
                {l.outstandingBalance != null && ` (Outstanding: ${formatCurrency(l.outstandingBalance)})`}
              </option>
            ))}
          </select>
          {errors.loanId && <p className="text-xs text-red-600 mt-1">{errors.loanId.message}</p>}

          {selectedLoan && (
            <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-700">
                Outstanding balance: <strong>{formatCurrency(selectedLoan.outstandingBalance ?? 0)}</strong>
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount (TSH)</label>
            <input type="number" {...register("amount", { valueAsNumber: true })} placeholder="100000" className="input" />
            {errors.amount && <p className="text-xs text-red-600 mt-1">{errors.amount.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Payment Date</label>
            <input type="date" {...register("paymentDate")} className="input" />
            {errors.paymentDate && <p className="text-xs text-red-600 mt-1">{errors.paymentDate.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Payment Method</label>
            <select {...register("paymentMethod")} className="input">
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Reference Number</label>
            <input {...register("referenceNumber")} placeholder="Transaction ID / cheque no." className="input" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
          <textarea {...register("notes")} rows={2} placeholder="Optional notes..." className="input resize-none" />
        </div>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={() => router.back()} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-60">
          {isSubmitting ? "Recording..." : "Record Payment"}
        </button>
      </div>
    </form>
  );
}
