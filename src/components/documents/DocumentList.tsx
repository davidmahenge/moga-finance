"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { DOCUMENT_TYPES } from "@/lib/utils";
import { CheckCircle, XCircle, ExternalLink, FileText } from "lucide-react";

interface Document {
  id: string;
  type: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  status: string;
  verifiedBy: string | null;
  verifiedAt: string | null;
  rejectionNote: string | null;
  uploadedAt: string;
}

function getDocLabel(type: string) {
  return DOCUMENT_TYPES.find((t) => t.value === type)?.label || type;
}

export function DocumentList({ documents }: { documents: Document[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [rejectionNote, setRejectionNote] = useState("");

  async function verify(docId: string, action: "VERIFIED" | "REJECTED", note?: string) {
    setLoading(docId);
    await fetch(`/api/documents/${docId}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, rejectionNote: note, verifiedBy: "Loan Officer" }),
    });
    setLoading(null);
    setShowRejectModal(null);
    router.refresh();
  }

  if (documents.length === 0) {
    return <p className="text-sm text-gray-400 py-8 text-center">No documents uploaded yet.</p>;
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <div key={doc.id} className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{getDocLabel(doc.type)}</p>
                <p className="text-xs text-gray-500 truncate">{doc.fileName}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {(doc.fileSize / 1024).toFixed(0)} KB · Uploaded {formatDate(doc.uploadedAt)}
                </p>
                {doc.rejectionNote && (
                  <p className="text-xs text-red-600 mt-1">Note: {doc.rejectionNote}</p>
                )}
                {doc.verifiedAt && doc.verifiedBy && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {doc.status === "VERIFIED" ? "Verified" : "Reviewed"} by {doc.verifiedBy} on {formatDate(doc.verifiedAt)}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <a
                href={doc.filePath}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="View file"
              >
                <ExternalLink className="w-4 h-4" />
              </a>

              <span
                className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  doc.status === "VERIFIED"
                    ? "bg-green-100 text-green-700"
                    : doc.status === "REJECTED"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {doc.status}
              </span>

              {doc.status === "PENDING" && (
                <>
                  <button
                    onClick={() => verify(doc.id, "VERIFIED")}
                    disabled={loading === doc.id}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-60"
                    title="Verify"
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowRejectModal(doc.id)}
                    disabled={loading === doc.id}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-60"
                    title="Reject"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Reject Modal */}
          {showRejectModal === doc.id && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Document</h3>
                <textarea
                  value={rejectionNote}
                  onChange={(e) => setRejectionNote(e.target.value)}
                  placeholder="Reason for rejection..."
                  rows={3}
                  className="input mb-4 resize-none"
                />
                <div className="flex gap-3">
                  <button onClick={() => setShowRejectModal(null)} className="flex-1 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg">Cancel</button>
                  <button onClick={() => verify(doc.id, "REJECTED", rejectionNote)} className="flex-1 py-2 text-sm font-medium text-white bg-red-600 rounded-lg">Confirm Reject</button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
