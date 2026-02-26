"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { customerSchema, CustomerFormData } from "@/lib/validations/customer.schema";
import { EMPLOYMENT_STATUSES } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface CustomerFormProps {
  defaultValues?: Partial<CustomerFormData>;
  customerId?: string;
}

export function CustomerForm({ defaultValues, customerId }: CustomerFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues,
  });

  async function onSubmit(data: CustomerFormData) {
    setError("");
    const url = customerId ? `/api/customers/${customerId}` : "/api/customers";
    const method = customerId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json();
      setError(body.error || "Failed to save customer");
      return;
    }

    const saved = await res.json();
    router.push(`/customers/${saved.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      {/* Personal Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="First Name" error={errors.firstName?.message}>
            <input {...register("firstName")} placeholder="John" className="input" />
          </Field>
          <Field label="Last Name" error={errors.lastName?.message}>
            <input {...register("lastName")} placeholder="Doe" className="input" />
          </Field>
          <Field label="Date of Birth" error={errors.dateOfBirth?.message}>
            <input type="date" {...register("dateOfBirth")} className="input" />
          </Field>
          <Field label="National ID" error={errors.nationalId?.message}>
            <input {...register("nationalId")} placeholder="19xxxxxxxxx" className="input" />
          </Field>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Email Address" error={errors.email?.message}>
            <input type="email" {...register("email")} placeholder="john@example.com" className="input" />
          </Field>
          <Field label="Phone Number" error={errors.phone?.message}>
            <input {...register("phone")} placeholder="+255 7xx xxx xxx" className="input" />
          </Field>
          <Field label="Residential Address" error={errors.address?.message} className="md:col-span-2">
            <input {...register("address")} placeholder="Street, Area" className="input" />
          </Field>
          <Field label="City" error={errors.city?.message}>
            <input {...register("city")} placeholder="Dar es Salaam" className="input" />
          </Field>
        </div>
      </div>

      {/* Employment */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Employment Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Employment Status" error={errors.employmentStatus?.message}>
            <select {...register("employmentStatus")} className="input">
              <option value="">Select status</option>
              {EMPLOYMENT_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Monthly Income (TSH)" error={errors.monthlyIncome?.message}>
            <input type="number" {...register("monthlyIncome", { valueAsNumber: true })} placeholder="500000" className="input" />
          </Field>
          <Field label="Employer Name" error={errors.employerName?.message} className="md:col-span-2">
            <input {...register("employerName")} placeholder="Company or business name" className="input" />
          </Field>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : customerId ? "Update Customer" : "Register Customer"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
  className = "",
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
