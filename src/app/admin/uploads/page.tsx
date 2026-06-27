"use client";

import { useEffect, useState } from "react";
import { Download, FileDown, Loader2, Search, Trash2 } from "lucide-react";
import { toast } from "@/components/toast";

interface UploadedFile {
  id: number;
  user_id: string;
  user_name: string;
  file_name: string;
  file_size: number;
  file_format: string;
  storage_path: string;
  created_at: string;
}

export default function AdminUploadsPage() {
  const [uploads, setUploads] = useState<UploadedFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [downloadingPath, setDownloadingPath] = useState<string | null>(null);

  const fetchUploads = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/uploads");
      if (!res.ok) {
        throw new Error("Failed to fetch uploads");
      }
      const data = await res.json();
      setUploads(data);
    } catch (err: any) {
      console.error("Error loading uploads:", err);
      toast.error("Failed to load uploaded files. Please refresh the page.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUploads();
  }, []);

  const handleDownloadFile = async (path: string, fileName: string) => {
    setDownloadingPath(path);
    try {
      const res = await fetch("/api/admin/models/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
      });

      if (!res.ok) {
        throw new Error("Failed to sign download link");
      }

      const { signedUrl } = await res.json();

      // Trigger file download in browser
      const a = document.createElement("a");
      a.href = signedUrl;
      const parts = path.split("-");
      const cleanName = parts.slice(1).join("-") || fileName || "model.stl";
      a.download = cleanName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Download started successfully.");
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Failed to download file. Please check your network connection.");
    } finally {
      setDownloadingPath(null);
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const filteredUploads = uploads.filter((upload) => {
    const query = searchQuery.toLowerCase();
    return (
      upload.file_name.toLowerCase().includes(query) ||
      upload.user_name.toLowerCase().includes(query) ||
      upload.file_format.toLowerCase().includes(query)
    );
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-on-surface tracking-tight">Uploads</h1>
        <p className="text-on-surface-variant mt-2">
          Browse and download custom 3D model files (.stl, .obj) uploaded by users.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/50" />
          <input
            type="text"
            placeholder="Search by file name or user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-container border border-outline-variant outline-none focus:border-primary text-sm transition-colors text-on-surface"
          />
        </div>
        <button
          onClick={fetchUploads}
          disabled={isLoading}
          className="px-4 py-2 rounded-xl border border-outline-variant hover:bg-surface-container text-sm font-semibold transition-all disabled:opacity-50 text-on-surface flex items-center gap-2"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : filteredUploads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl bg-surface-container-lowest border border-outline-variant text-center">
          <FileDown className="w-12 h-12 text-on-surface-variant/30 mb-4" />
          <p className="text-on-surface-variant text-sm font-medium">
            {searchQuery ? "No matching uploads found." : "No uploaded files found."}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low text-on-surface-variant">
                  <th className="py-4 px-6 font-semibold">File Name</th>
                  <th className="py-4 px-6 font-semibold">Uploaded By</th>
                  <th className="py-4 px-6 font-semibold">Format</th>
                  <th className="py-4 px-6 font-semibold">Size</th>
                  <th className="py-4 px-6 font-semibold">Upload Date</th>
                  <th className="py-4 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {filteredUploads.map((upload) => (
                  <tr
                    key={upload.id}
                    className="hover:bg-surface-container-low/20 transition-colors text-on-surface"
                  >
                    <td className="py-4 px-6 font-medium max-w-xs truncate" title={upload.file_name}>
                      {upload.file_name}
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-semibold">{upload.user_name}</p>
                        <p className="text-xs text-on-surface-variant font-mono mt-0.5">{upload.user_id.slice(0, 8)}...</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase bg-primary/10 text-primary">
                        {upload.file_format}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs">
                      {formatBytes(upload.file_size)}
                    </td>
                    <td className="py-4 px-6 text-on-surface-variant text-xs">
                      {new Date(upload.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => handleDownloadFile(upload.storage_path, upload.file_name)}
                        disabled={downloadingPath === upload.storage_path}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl gradient-primary text-white text-xs font-semibold hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {downloadingPath === upload.storage_path ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Signing...
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" />
                            Download
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
