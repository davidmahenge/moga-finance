"use client";

import { useState } from "react";
import { Bell } from "lucide-react";

export function DebtAlertButton({ loanId }: { loanId: string }) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function sendAlert() {
    setLoading(true);
    const res = await fetch("/api/alerts/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loanId }),
    });
    setLoading(false);
    if (res.ok) {
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    }
  }

  return (
    <button
      onClick={sendAlert}
      disabled={loading || sent}
      className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
        sent
          ? "bg-green-100 text-green-700"
          : "bg-amber-100 text-amber-700 hover:bg-amber-200"
      } disabled:opacity-60`}
    >
      <Bell className="w-3.5 h-3.5" />
      {loading ? "Sending..." : sent ? "Sent!" : "Remind"}
    </button>
  );
}
