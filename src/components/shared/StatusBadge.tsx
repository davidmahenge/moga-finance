"use client";
import { STATUS_COLORS } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  UNDER_REVIEW: "Under Review",
  APPROVED: "Approved",
  ACTIVE: "Active",
  CLOSED: "Closed",
  REJECTED: "Rejected",
  DEFAULTED: "Defaulted",
  OVERDUE: "Overdue",
  VERIFIED: "Verified",
  PENDING_DOC: "Pending",
};

export function StatusBadge({ status }: { status: string }) {
  const colorClass = STATUS_COLORS[status] || "bg-gray-100 text-gray-700";
  const label = STATUS_LABELS[status] || status;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
    >
      {label}
    </span>
  );
}
