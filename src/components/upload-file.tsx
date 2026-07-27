"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X, CheckCircle, Loader2 } from "lucide-react";
import { STLAnalysis, parseModel } from "@/lib/utils/stl-parser";
import { generateStlThumbnail } from "@/lib/utils/stl-thumbnailer";

interface UploadedFile {
  file: File;
  name: string;
  size: string;
  format: string;
}

interface UploadFileProps {
  onFileUploaded?: (file: File, isReference?: boolean) => void;
  onAnalysisComplete?: (analysis: STLAnalysis) => void;
  onRemoveFile?: () => void;
  compact?: boolean;
}

// Reference/quote-request files stored in Supabase (small images & PDFs).
const REFERENCE_EXTS = ["jpg", "jpeg", "png", "webp", "pdf"];
const MAX_REFERENCE_SIZE = 25 * 1024 * 1024; // 25MB

export function UploadFile({ 
  onFileUploaded, 
  onAnalysisComplete,
  onRemoveFile,
  compact = false 
}: UploadFileProps) {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [isReferenceFile, setIsReferenceFile] = useState(false);
  const [sizeError, setSizeError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1048576).toFixed(1)} MB`;
      };

      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      const format = ext.toUpperCase() || "Unknown";
      const reference = REFERENCE_EXTS.includes(ext);

      // Enforce the 25MB cap for reference files (images / PDFs).
      if (reference && file.size > MAX_REFERENCE_SIZE) {
        setSizeError("Reference files (images/PDF) must be 25MB or smaller.");
        return;
      }
      setSizeError(null);

      setUploadedFile({
        file,
        name: file.name,
        size: formatSize(file.size),
        format,
      });
      setIsReferenceFile(reference);

      onFileUploaded?.(file, reference);

      // Reference files (images / PDFs) have no geometry to analyze — they're
      // submitted for a manual quote, so we mark them ready immediately.
      if (reference) {
        setIsAnalyzing(false);
        setAnalyzed(true);
        return;
      }

      // --- 3D model: analyze geometry for the instant quote ---
      setIsAnalyzing(true);
      setAnalyzed(false);

      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target?.result;
        if (arrayBuffer instanceof ArrayBuffer) {
          // Add a minor micro-timeout to show the premium analysis animation
          setTimeout(() => {
            const fmt = format.toLowerCase();

            // Thumbnail preview is only available for STL geometry.
            let thumbnail: string | undefined;
            if (fmt === "stl") {
              try {
                thumbnail = generateStlThumbnail(arrayBuffer);
              } catch (thumbnailError) {
                console.error("Failed to generate thumbnail:", thumbnailError);
              }
            }

            setIsAnalyzing(false);
            setAnalyzed(true);

            try {
              // Parse synchronously on the main thread. This is reliable across
              // bundlers/environments (a web worker can silently fail to load,
              // leaving analysis null and the quote frozen), and fast for the
              // STL/OBJ sizes used here. The quote then reflects the ACTUAL
              // model geometry so material/scale/infill changes update the price.
              const result = parseModel(arrayBuffer, fmt);
              onAnalysisComplete?.({ ...result, thumbnail });
            } catch (parseErr) {
              console.error("3D model parse failed, using fallback estimate:", parseErr);
              onAnalysisComplete?.({
                volume: 18200,
                dimensions: { x: 50.0, y: 50.0, z: 50.0 },
                triangleCount: 8500,
              });
            }
          }, 800);
        }
      };

      reader.onerror = () => {
        setIsAnalyzing(false);
        setAnalyzed(false);
      };

      reader.readAsArrayBuffer(file);
    },
    [onFileUploaded, onAnalysisComplete]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "model/stl": [".stl"],
      "model/obj": [".obj"],
      "application/octet-stream": [".stl", ".obj"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    maxSize: 2 * 1024 * 1024 * 1024, // 2GB (per-type limits enforced in onDrop)
  });

  const removeFile = () => {
    setUploadedFile(null);
    setAnalyzed(false);
    setIsAnalyzing(false);
    setIsReferenceFile(false);
    setSizeError(null);
    onRemoveFile?.();
  };

  if (uploadedFile) {
    return (
      <div className="rounded-2xl bg-surface-container-low p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-heading text-sm font-semibold text-on-surface truncate">
              {uploadedFile.name}
            </h4>
            <p className="text-xs text-on-surface-variant mt-1">
              {uploadedFile.format} · {uploadedFile.size}
            </p>
            {isAnalyzing && (
              <div className="flex items-center gap-2 mt-3">
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                <span className="text-xs text-primary font-medium">
                  Analyzing material requirements...
                </span>
              </div>
            )}
            {analyzed && (
              <div className="flex items-center gap-2 mt-3">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span className="text-xs text-emerald-600 font-medium">
                  {isReferenceFile
                    ? "Reference file ready — submit for a quote"
                    : "Analysis complete — Ready for slicing"}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={removeFile}
            className="p-2 rounded-full hover:bg-surface-container transition-colors"
            aria-label="Remove file"
          >
            <X className="w-4 h-4 text-on-surface-variant" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`group relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer ${
        isDragActive
          ? "border-primary bg-primary/5"
          : "border-outline-variant hover:border-primary/40 hover:bg-surface-container-low"
      } ${compact ? "p-8" : "p-12"}`}
      id="upload-dropzone"
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center text-center gap-4">
        <div className={`rounded-full bg-surface-container group-hover:bg-primary/10 transition-colors flex items-center justify-center ${
          compact ? "w-12 h-12" : "w-16 h-16"
        }`}>
          <Upload className={`text-on-surface-variant group-hover:text-primary transition-colors ${
            compact ? "w-5 h-5" : "w-7 h-7"
          }`} />
        </div>
        <div>
          <p className={`font-heading font-semibold text-on-surface ${compact ? "text-sm" : "text-base"}`}>
            {isDragActive ? "Drop your file here" : "Drag & drop your 3D model"}
          </p>
          <p className="text-sm text-on-surface-variant mt-1">
            <span className="font-medium text-on-surface">.STL / .OBJ</span> models up to 2GB, or{" "}
            <span className="font-medium text-on-surface">JPG, PNG, WEBP, PDF</span> reference files up to 25MB
          </p>
          {sizeError && (
            <p className="text-xs text-destructive font-medium mt-2">{sizeError}</p>
          )}
        </div>
        <button
          type="button"
          className="px-6 py-2.5 rounded-full bg-surface-container-highest text-sm font-medium text-on-surface hover:bg-primary hover:text-white transition-all duration-300"
        >
          Browse Files
        </button>
      </div>
    </div>
  );
}
