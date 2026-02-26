"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, PlayCircle, AlertCircle } from "lucide-react";

interface LoanActionsProps {
  loanId: string;
  status: string;
}

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["UNDER_REVIEW", "REJECTED"],
  UNDER_REVIEW: ["APPROVED", "REJECTED"],
  APPROVED: ["ACTIVE"],
  ACTIVE: ["CLOSED", "DEFAULTED"],
};

const ACTION_CONFIG = {
  UNDER_REVIEW: { label: "Move to Review", icon: AlertCircle, color: "bg-amber-500 hover:bg-amber-600" },
  APPROVED: { label: "Approve Loan", icon: CheckCircle, color: "bg-blue-600 hover:bg-blue-700" },
  ACTIVE: { label: "Activate / Disburse", icon: PlayCircle, color: "bg-green-600 hover:bg-green-700" },
  REJECTED: { label: "Reject Loan", icon: XCircle, color: "bg-red-500 hover:bg-red-600" },
  CLOSED: { label: "Mark Closed", icon: CheckCircle, color: "bg-slate-500 hover:bg-slate-600" },
  DEFAULTED: { label: "Mark Defaulted", icon: AlertCircle, color: "bg-red-900 hover:bg-red-800" },
};

export function LoanActions({ loanId, status }: LoanActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDisburseModal, setShowDisburseModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [disbursementDate, setDisbursementDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const availableActions = VALID_TRANSITIONS[status] || [];

  async function performAction(newStatus: string, extra?: Record<string, string>) {
    setLoading(newStatus);
    const res = await fetch(`/api/loans/${loanId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, ...extra }),
    });

    setLoading(null);
    if (res.ok) {
      setShowRejectModal(false);
      setShowDisburseModal(false);
      router.refresh();
    }
  }

  if (availableActions.length === 0) return null;

  return (
    <div className="flex gap-2 flex-wrap">
      {availableActions.map((action) => {
        const config = ACTION_CONFIG[action as keyof typeof ACTION_CONFIG];
        if (!config) return null;
        const Icon = config.icon;

        return (
          <button
            key={action}
            onClick={() => {
              if (action === "REJECTED") setShowRejectModal(true);
              else if (action === "ACTIVE" || action === "APPROVED") setShowDisburseModal(true);
              else performAction(action);
            }}
            disabled={loading !== null}
            className={`flex items-center gap-2 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-60 ${config.color}`}
          >
            <Icon className="w-4 h-4" />
            {loading === action ? "Processing..." : config.label}
          </button>
        );
      })}

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Loan Application</h3>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Provide a reason for rejection..."
              rows={4}
              className="input mb-4 resize-none"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowRejectModal(false)} className="flex-1 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                Cancel
              </button>
              <button
                onClick={() => performAction("REJECTED", { rejectionReason })}
                disabled={!rejectionReason.trim()}
                className="flex-1 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-60"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disburse / Approve Modal */}
      {showDisburseModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {availableActions.includes("ACTIVE") ? "Disburse Loan" : "Approve Loan"}
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Disbursement Date</label>
              <input
                type="date"
                value={disbursementDate}
                onChange={(e) => setDisbursementDate(e.target.value)}
                className="input"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowDisburseModal(false)} className="flex-1 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                Cancel
              </button>
              <button
                onClick={() => {
                  const newStatus = availableActions.find((a) => a === "ACTIVE") ? "ACTIVE" : "APPROVED";
                  performAction(newStatus, { disbursementDate, approvedBy: "Loan Officer" });
                }}
                className="flex-1 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
