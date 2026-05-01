"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X, CheckCircle, Loader2 } from "lucide-react";

interface UploadedFile {
  file: File;
  name: string;
  size: string;
  format: string;
}

interface UploadFileProps {
  onFileUploaded?: (file: File) => void;
  compact?: boolean;
}

export function UploadFile({ onFileUploaded, compact = false }: UploadFileProps) {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1048576).toFixed(1)} MB`;
      };

      setUploadedFile({
        file,
        name: file.name,
        size: formatSize(file.size),
        format: file.name.split(".").pop()?.toUpperCase() || "Unknown",
      });

      setIsAnalyzing(true);
      setTimeout(() => {
        setIsAnalyzing(false);
        setAnalyzed(true);
      }, 2000);

      onFileUploaded?.(file);
    },
    [onFileUploaded]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "model/stl": [".stl"],
      "model/obj": [".obj"],
      "application/octet-stream": [".stl", ".obj"],
    },
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024, // 100MB
  });

  const removeFile = () => {
    setUploadedFile(null);
    setAnalyzed(false);
    setIsAnalyzing(false);
  };

  if (uploadedFile) {
    return (
      <div className="rounded-2xl bg-surface-container-low p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
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
                  Analysis complete — Ready for slicing
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
            Supports <span className="font-medium text-on-surface">.STL</span> and{" "}
            <span className="font-medium text-on-surface">.OBJ</span> files up to 100MB
          </p>
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
