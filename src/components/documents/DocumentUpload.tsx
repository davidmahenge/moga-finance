"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, FileText } from "lucide-react";
import { DOCUMENT_TYPES } from "@/lib/utils";

export function DocumentUpload({ loanId }: { loanId: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleUpload() {
    if (!file || !type) {
      setError("Please select a file and document type");
      return;
    }

    setError("");
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("loanId", loanId);
    formData.append("type", type);

    const res = await fetch("/api/documents", { method: "POST", body: formData });
    setUploading(false);

    if (!res.ok) {
      const body = await res.json();
      setError(body.error || "Upload failed");
      return;
    }

    setFile(null);
    setType("");
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    router.refresh();
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Upload Document</h3>

      {error && <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
      {success && <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">Document uploaded successfully!</div>}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Document Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="input">
            <option value="">Select type...</option>
            {DOCUMENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">File (max 10MB, JPEG/PNG/PDF)</label>
          {file ? (
            <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <FileText className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-blue-700 flex-1 truncate">{file.name}</span>
              <button onClick={() => setFile(null)} className="text-blue-400 hover:text-blue-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-xl p-8 text-center transition-colors group"
            >
              <Upload className="w-8 h-8 text-gray-300 group-hover:text-blue-400 mx-auto mb-2 transition-colors" />
              <p className="text-sm text-gray-500 group-hover:text-blue-600 transition-colors">Click to select file</p>
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                if (f.size > 10 * 1024 * 1024) { setError("File must be under 10MB"); return; }
                setFile(f);
                setError("");
              }
            }}
          />
        </div>

        <button
          onClick={handleUpload}
          disabled={uploading || !file || !type}
          className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {uploading ? "Uploading..." : "Upload Document"}
        </button>
      </div>
    </div>
  );
}
