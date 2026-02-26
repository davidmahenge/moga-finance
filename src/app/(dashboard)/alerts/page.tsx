import { Header } from "@/components/layout/Header";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import { Bell, CheckCircle, XCircle } from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  PAYMENT_DUE: "Payment Due Reminder",
  PAYMENT_OVERDUE: "Overdue Payment Notice",
  LOAN_APPROVED: "Loan Approved",
  LOAN_REJECTED: "Loan Rejected",
  PAYMENT_RECEIVED: "Payment Received",
  MANUAL: "Manual Alert",
};

const TYPE_COLORS: Record<string, string> = {
  PAYMENT_DUE: "bg-amber-100 text-amber-700",
  PAYMENT_OVERDUE: "bg-red-100 text-red-700",
  LOAN_APPROVED: "bg-blue-100 text-blue-700",
  LOAN_REJECTED: "bg-red-100 text-red-700",
  PAYMENT_RECEIVED: "bg-green-100 text-green-700",
  MANUAL: "bg-gray-100 text-gray-700",
};

export default async function AlertsPage() {
  const alerts = await prisma.alertLog.findMany({
    include: { loan: { select: { loanNumber: true } } },
    orderBy: { sentAt: "desc" },
    take: 100,
  });

  const sentCount = alerts.filter((a) => a.status === "SENT").length;
  const failedCount = alerts.filter((a) => a.status === "FAILED").length;

  return (
    <div>
      <Header title="Alert Log" subtitle={`${alerts.length} alerts sent`} />

      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Total Alerts</p>
            <p className="text-2xl font-bold text-gray-900">{alerts.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Delivered</p>
            <p className="text-2xl font-bold text-green-600">{sentCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Failed</p>
            <p className="text-2xl font-bold text-red-500">{failedCount}</p>
          </div>
        </div>

        {alerts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
            <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No alerts sent yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Recipient</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Type</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Loan</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Subject</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Sent At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {alerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-gray-900">{alert.recipientName}</p>
                      <p className="text-xs text-gray-500">{alert.recipientEmail}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[alert.type] || "bg-gray-100 text-gray-600"}`}>
                        {TYPE_LABELS[alert.type] || alert.type}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600">{alert.loan?.loanNumber || "—"}</td>
                    <td className="px-5 py-3 text-sm text-gray-700 max-w-xs truncate">{alert.subject}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        {alert.status === "SENT" ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`text-xs font-medium ${alert.status === "SENT" ? "text-green-600" : "text-red-600"}`}>
                          {alert.status}
                        </span>
                      </div>
                      {alert.errorMessage && (
                        <p className="text-xs text-red-500 mt-0.5 truncate max-w-xs">{alert.errorMessage}</p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">{formatDateTime(alert.sentAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
