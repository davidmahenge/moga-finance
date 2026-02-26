"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { collateralSchema, CollateralFormData } from "@/lib/validations/collateral.schema";
import { useRouter } from "next/navigation";
import { formatDate, formatCurrency, COLLATERAL_TYPES } from "@/lib/utils";
import { Plus, Trash2, Archive } from "lucide-react";
import { format } from "date-fns";

interface Collateral {
  id: string;
  type: string;
  description: string;
  estimatedValue: number;
  valuationDate: string;
  valuedBy: string | null;
  location: string | null;
  notes: string | null;
}

export function CollateralManager({ loanId, collaterals: initial }: { loanId: string; collaterals: Collateral[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CollateralFormData>({
    resolver: zodResolver(collateralSchema),
    defaultValues: { loanId },
  });

  async function onSubmit(data: CollateralFormData) {
    const res = await fetch("/api/collateral", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      reset({ loanId });
      setShowForm(false);
      router.refresh();
    }
  }

  async function deleteCollateral(id: string) {
    if (!confirm("Remove this collateral record?")) return;
    setDeleting(id);
    await fetch(`/api/collateral/${id}`, { method: "DELETE" });
    setDeleting(null);
    router.refresh();
  }

  return (
    <div className="space-y-5">
      {/* Existing collaterals */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Collateral Items ({initial.length})</h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Collateral
          </button>
        </div>

        {initial.length === 0 && !showForm ? (
          <div className="py-10 text-center">
            <Archive className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No collateral recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {initial.map((c) => (
              <div key={c.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-900">{c.description}</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {COLLATERAL_TYPES.find((t) => t.value === c.type)?.label || c.type}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-blue-700">{formatCurrency(c.estimatedValue)}</p>
                    <div className="flex gap-4 mt-1.5">
                      <p className="text-xs text-gray-400">Valued on {formatDate(c.valuationDate)}</p>
                      {c.valuedBy && <p className="text-xs text-gray-400">by {c.valuedBy}</p>}
                      {c.location && <p className="text-xs text-gray-400">📍 {c.location}</p>}
                    </div>
                    {c.notes && <p className="text-xs text-gray-500 mt-1">{c.notes}</p>}
                  </div>
                  <button
                    onClick={() => deleteCollateral(c.id)}
                    disabled={deleting === c.id}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Form */}
      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Add Collateral</h3>
          <input type="hidden" {...register("loanId")} value={loanId} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
              <select {...register("type")} className="input">
                <option value="">Select type...</option>
                {COLLATERAL_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              {errors.type && <p className="text-xs text-red-600 mt-1">{errors.type.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Estimated Value (TSH)</label>
              <input type="number" {...register("estimatedValue", { valueAsNumber: true })} placeholder="5000000" className="input" />
              {errors.estimatedValue && <p className="text-xs text-red-600 mt-1">{errors.estimatedValue.message}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <input {...register("description")} placeholder="e.g. Toyota Land Cruiser 2015, Plot No 123..." className="input" />
              {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Valuation Date</label>
              <input type="date" {...register("valuationDate")} defaultValue={format(new Date(), "yyyy-MM-dd")} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Valued By</label>
              <input {...register("valuedBy")} placeholder="Assessor name" className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
              <input {...register("location")} placeholder="Physical location" className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
              <input {...register("notes")} placeholder="Additional notes" className="input" />
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-60">
              {isSubmitting ? "Saving..." : "Save Collateral"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
