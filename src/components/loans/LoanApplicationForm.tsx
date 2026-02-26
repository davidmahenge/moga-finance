"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loanSchema, LoanFormData } from "@/lib/validations/loan.schema";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { calculateMonthlyPayment, calculateTotalInterest } from "@/lib/loan-calculator";
import { formatCurrency } from "@/lib/utils";

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  nationalId: string;
}

export function LoanApplicationForm({ customers }: { customers: Customer[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCustomer = searchParams.get("customerId") || "";

  const [error, setError] = useState("");
  const [preview, setPreview] = useState<{
    monthly: number;
    totalInterest: number;
    totalPayable: number;
  } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoanFormData>({
    resolver: zodResolver(loanSchema),
    defaultValues: { customerId: preselectedCustomer },
  });

  const [amount, rate, term] = watch(["principalAmount", "interestRate", "termMonths"]);

  useEffect(() => {
    if (amount > 0 && rate > 0 && term > 0) {
      const monthly = calculateMonthlyPayment(Number(amount), Number(rate), Number(term));
      const totalInterest = calculateTotalInterest(Number(amount), Number(rate), Number(term));
      setPreview({
        monthly,
        totalInterest,
        totalPayable: Number(amount) + totalInterest,
      });
    } else {
      setPreview(null);
    }
  }, [amount, rate, term]);

  async function onSubmit(data: LoanFormData) {
    setError("");
    const res = await fetch("/api/loans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json();
      setError(body.error || "Failed to submit application");
      return;
    }

    const loan = await res.json();
    router.push(`/loans/${loan.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      {/* Customer Selection */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Select Customer</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Customer</label>
          <select {...register("customerId")} className="input">
            <option value="">Choose a customer...</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstName} {c.lastName} — {c.nationalId}
              </option>
            ))}
          </select>
          {errors.customerId && <p className="text-xs text-red-600 mt-1">{errors.customerId.message}</p>}
        </div>
      </div>

      {/* Loan Terms */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Loan Terms</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Loan Amount (TSH)</label>
            <input type="number" {...register("principalAmount", { valueAsNumber: true })} placeholder="1000000" className="input" />
            {errors.principalAmount && <p className="text-xs text-red-600 mt-1">{errors.principalAmount.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Annual Interest Rate (%)</label>
            <input type="number" step="0.1" {...register("interestRate", { valueAsNumber: true })} placeholder="12.5" className="input" />
            {errors.interestRate && <p className="text-xs text-red-600 mt-1">{errors.interestRate.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Term (months)</label>
            <input type="number" {...register("termMonths", { valueAsNumber: true })} placeholder="12" className="input" />
            {errors.termMonths && <p className="text-xs text-red-600 mt-1">{errors.termMonths.message}</p>}
          </div>
        </div>

        {/* Live Preview */}
        {preview && (
          <div className="mt-5 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs font-semibold text-blue-700 mb-3 uppercase tracking-wide">Payment Preview</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-blue-600">Monthly Payment</p>
                <p className="text-lg font-bold text-blue-800">{formatCurrency(preview.monthly)}</p>
              </div>
              <div>
                <p className="text-xs text-blue-600">Total Interest</p>
                <p className="text-lg font-bold text-blue-800">{formatCurrency(preview.totalInterest)}</p>
              </div>
              <div>
                <p className="text-xs text-blue-600">Total Payable</p>
                <p className="text-lg font-bold text-blue-800">{formatCurrency(preview.totalPayable)}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Purpose */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Purpose &amp; Notes</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Loan Purpose</label>
            <textarea
              {...register("purpose")}
              rows={3}
              placeholder="Describe what the loan will be used for..."
              className="input resize-none"
            />
            {errors.purpose && <p className="text-xs text-red-600 mt-1">{errors.purpose.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Additional Notes (optional)</label>
            <textarea {...register("notes")} rows={2} placeholder="Any additional notes..." className="input resize-none" />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={() => router.back()} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-60">
          {isSubmitting ? "Submitting..." : "Submit Application"}
        </button>
      </div>
    </form>
  );
}
