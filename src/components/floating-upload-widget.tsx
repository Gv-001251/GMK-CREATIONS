"use client";

import { useEffect, useState } from "react";
import { useUploadStore } from "@/lib/store/upload-store";
import { Loader2, ChevronUp, ChevronDown, X, AlertTriangle, CheckCircle2, ShoppingCart } from "lucide-react";

export function FloatingUploadWidget() {
  const {
    uploadedFile,
    uploadStatus,
    uploadProgress,
    uploadedBytes,
    totalBytes,
    uploadSpeed,
    uploadError,
    abortUpload,
  } = useUploadStore();

  const [isMinimized, setIsMinimized] = useState(false);

  // Auto-dismiss success notification after 4 seconds
  useEffect(() => {
    if (uploadStatus === "success") {
      const timer = setTimeout(() => {
        useUploadStore.setState({ uploadStatus: "idle", uploadedFile: null });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [uploadStatus]);

  if (uploadStatus === "idle" || !uploadedFile) return null;

  const fileExt = uploadedFile.name.split(".").pop()?.toUpperCase() || "FILE";

  const handleDismiss = () => {
    useUploadStore.setState({ uploadStatus: "idle", uploadedFile: null });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up select-none">
      {isMinimized ? (
        /* MINIMIZED WIDGET */
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-3 px-5 py-3 rounded-full bg-neutral-900/90 text-white border border-white/10 shadow-2xl backdrop-blur-xl hover:bg-neutral-800/95 transition-all group"
        >
          {uploadStatus === "uploading" ? (
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
          ) : uploadStatus === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-destructive" />
          )}
          
          <span className="text-xs font-semibold tracking-wide">
            {uploadStatus === "uploading"
              ? `Uploading model: ${uploadProgress}%`
              : uploadStatus === "success"
              ? "Upload complete!"
              : "Upload failed"}
          </span>

          <ChevronUp className="w-3.5 h-3.5 text-white/50 group-hover:text-white transition-colors ml-1" />
        </button>
      ) : (
        /* EXPANDED WIDGET */
        <div className="glass-dark text-white rounded-2xl p-6 w-80 sm:w-88 border border-white/10 shadow-2xl backdrop-blur-xl flex flex-col space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <span className="text-xs font-bold text-white/40 tracking-wider uppercase font-heading">
              Cloud Upload Queue
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
                title="Minimize"
              >
                <ChevronDown className="w-4 h-4 text-white/60" />
              </button>
              {(uploadStatus === "success" || uploadStatus === "error") && (
                <button
                  onClick={handleDismiss}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors"
                  title="Dismiss"
                >
                  <X className="w-4 h-4 text-white/60" />
                </button>
              )}
            </div>
          </div>

          {uploadStatus === "uploading" && (
            <>
              {/* Spinning status & speed */}
              <div className="flex items-center gap-3">
                <div className="relative shrink-0 w-10 h-10 flex items-center justify-center bg-primary/10 rounded-xl border border-primary/20">
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold truncate text-white" title={uploadedFile.name}>
                    {uploadedFile.name}
                  </h4>
                  <p className="text-[10px] text-white/50 font-mono">
                    {uploadSpeed > 0
                      ? `${(uploadSpeed / (1024 * 1024)).toFixed(1)} MB/s`
                      : "Connecting..."}
                  </p>
                </div>
                <span className="text-xs font-bold text-primary tabular-nums">
                  {uploadProgress}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300 shadow-[0_0_6px_rgba(59,130,246,0.4)]"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                {totalBytes > 0 && (
                  <div className="flex justify-between text-[9px] text-white/40 font-mono">
                    <span>
                      {(uploadedBytes / (1024 * 1024)).toFixed(1)} MB / {(totalBytes / (1024 * 1024)).toFixed(1)} MB
                    </span>
                    <span>
                      {fileExt} file
                    </span>
                  </div>
                )}
              </div>

              {/* Steps List */}
              <div className="bg-black/35 p-3 rounded-xl border border-white/5 text-[10px] space-y-1.5 leading-snug">
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span className="text-white/80">Validated model constraints</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {uploadProgress > 0 ? (
                    <>
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span className="text-white/80">Established secure connections</span>
                    </>
                  ) : (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin text-primary" />
                      <span className="text-white/50">Establishing connection...</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {uploadProgress === 100 ? (
                    <>
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span className="text-white/80">Transferred all file data</span>
                    </>
                  ) : uploadProgress > 0 ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin text-primary" />
                      <span className="text-white/90 font-medium">Uploading part blocks ({uploadProgress}%)</span>
                    </>
                  ) : (
                    <>
                      <span className="w-3 h-3 rounded-full bg-white/10 shrink-0" />
                      <span className="text-white/30">Waiting to upload data...</span>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <button
                onClick={abortUpload}
                className="w-full py-2 rounded-lg bg-white/5 hover:bg-destructive/20 hover:text-white border border-white/10 text-xs font-semibold text-white/80 transition-all uppercase tracking-wider"
              >
                Cancel Upload
              </button>
            </>
          )}

          {uploadStatus === "success" && (
            <div className="flex flex-col items-center text-center space-y-3 py-3">
              <div className="w-12 h-12 flex items-center justify-center bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full animate-bounce">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">Upload Succeeded!</h4>
                <p className="text-xs text-white/60 max-w-xs mx-auto truncate" title={uploadedFile.name}>
                  {uploadedFile.name}
                </p>
                <p className="text-[10px] text-emerald-400 font-medium flex items-center justify-center gap-1 mt-1">
                  <ShoppingCart className="w-3.5 h-3.5" />
                  Item added to your cart
                </p>
              </div>
            </div>
          )}

          {uploadStatus === "error" && (
            <div className="flex flex-col items-center text-center space-y-3 py-2">
              <div className="w-12 h-12 flex items-center justify-center bg-destructive/20 text-destructive border border-destructive/30 rounded-full">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1 w-full">
                <h4 className="text-sm font-bold text-white">Upload Failed</h4>
                <p className="text-xs text-destructive-foreground/80 line-clamp-2 px-1 text-center font-medium bg-destructive/10 border border-destructive/15 rounded-lg py-1.5">
                  {uploadError}
                </p>
              </div>
              <button
                onClick={handleDismiss}
                className="w-full py-2 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition-all uppercase tracking-wider border border-white/5"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
