import { create } from "zustand";
import { useCartStore } from "./cart-store";
import { toast } from "@/components/toast";

interface UploadOptions {
  productId: string;
  name: string;
  price: number;
  image: string;
  material: string;
  finish: string;
  quantity: number;
}

interface UploadState {
  uploadedFile: File | null;
  uploadStatus: "idle" | "uploading" | "success" | "error";
  uploadProgress: number;
  uploadedBytes: number;
  totalBytes: number;
  uploadSpeed: number; // bytes/sec
  uploadError: string | null;
  activeXHRs: XMLHttpRequest[];
  startUpload: (file: File, options: UploadOptions) => Promise<void>;
  abortUpload: () => void;
}

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks (B2/S3 minimum part size is 5MB)
const MAX_CONCURRENT_UPLOADS = 3; // Upload up to 3 chunks in parallel

export const useUploadStore = create<UploadState>((set, get) => ({
  uploadedFile: null,
  uploadStatus: "idle",
  uploadProgress: 0,
  uploadedBytes: 0,
  totalBytes: 0,
  uploadSpeed: 0,
  uploadError: null,
  activeXHRs: [],

  abortUpload: () => {
    const { activeXHRs } = get();
    activeXHRs.forEach((xhr) => xhr.abort());
    set({
      uploadedFile: null,
      uploadStatus: "idle",
      uploadProgress: 0,
      uploadedBytes: 0,
      totalBytes: 0,
      uploadSpeed: 0,
      uploadError: null,
      activeXHRs: [],
    });
  },

  startUpload: async (file: File, options: UploadOptions) => {
    // 1. Reset and initialize upload state
    get().abortUpload();
    set({
      uploadedFile: file,
      uploadStatus: "uploading",
      totalBytes: file.size,
      uploadProgress: 0,
      uploadedBytes: 0,
      uploadSpeed: 0,
    });

    const isSmallFile = file.size < CHUNK_SIZE;

    try {
      if (isSmallFile) {
        // --- 2a. Single-connection Upload for small files (<5MB) ---
        console.log("File is small (<5MB), performing direct single-part upload...");
        
        const initRes = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            fileSize: file.size,
          }),
        });

        if (!initRes.ok) {
          const errData = await initRes.json();
          throw new Error(errData.error || "Failed to initiate single upload");
        }

        const { signedUrl, path } = await initRes.json();

        // Upload file via XHR to B2 presigned PUT URL
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          set((state) => ({ activeXHRs: [xhr] }));

          const startTime = Date.now();

          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const elapsed = (Date.now() - startTime) / 1000;
              const currentSpeed = elapsed > 0 ? e.loaded / elapsed : 0;
              const percent = Math.min(Math.round((e.loaded / e.total) * 100), 99); // Hold at 99% until complete endpoint finishes

              set({
                uploadedBytes: e.loaded,
                uploadProgress: percent,
                uploadSpeed: currentSpeed,
              });
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error(`Storage upload failed with status ${xhr.status}`));
            }
          };

          xhr.onerror = () => reject(new Error("Network connection error"));
          
          xhr.open("PUT", signedUrl);
          xhr.setRequestHeader("Content-Type", "application/octet-stream");
          xhr.send(file);
        });

        // Add to cart on success
        const cleanFinish = options.finish.replace(/\s*\[File:\s*.*?\]/, "");
        useCartStore.getState().addItem({
          ...options,
          finish: `${cleanFinish} [File: ${path}]`,
          storagePath: path,
        });

        set({
          uploadStatus: "success",
          uploadProgress: 100,
          activeXHRs: [],
        });
        toast.success(`"${file.name}" added to cart!`);

      } else {
        // --- 2b. Parallel Multipart Upload for large files (>=5MB) ---
        console.log("File is large (>=5MB), performing parallel multipart upload...");

        const initRes = await fetch("/api/upload/multipart/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            fileSize: file.size,
          }),
        });

        if (!initRes.ok) {
          const errData = await initRes.json();
          throw new Error(errData.error || "Failed to initiate multipart upload");
        }

        const { uploadId, key } = await initRes.json();

        // Slice file into parts
        const numParts = Math.ceil(file.size / CHUNK_SIZE);
        const partsToUpload: Blob[] = [];
        for (let i = 0; i < numParts; i++) {
          const start = i * CHUNK_SIZE;
          const end = Math.min(start + CHUNK_SIZE, file.size);
          partsToUpload.push(file.slice(start, end));
        }

        const partETags: { ETag: string; PartNumber: number }[] = [];
        const partProgress = new Array(numParts).fill(0);
        let completedPartsCount = 0;

        const startTime = Date.now();

        // Helper to run part uploads with concurrency throttling
        const uploadPart = async (partIndex: number): Promise<void> => {
          const partBlob = partsToUpload[partIndex];
          const partNumber = partIndex + 1;

          // Request presigned URL for this part
          const signRes = await fetch("/api/upload/multipart/sign-part", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uploadId, partNumber, key }),
          });

          if (!signRes.ok) {
            const errData = await signRes.json();
            throw new Error(`Failed to sign part ${partNumber}: ${errData.error}`);
          }

          const { signedUrl } = await signRes.json();

          // Upload the chunk via XHR
          await new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            set((state) => ({ activeXHRs: [...state.activeXHRs, xhr] }));

            xhr.upload.onprogress = (e) => {
              if (e.lengthComputable) {
                partProgress[partIndex] = e.loaded;
                
                // Aggregate bytes and progress
                const totalUploaded = partProgress.reduce((sum, val) => sum + val, 0);
                const elapsed = (Date.now() - startTime) / 1000;
                const currentSpeed = elapsed > 0 ? totalUploaded / elapsed : 0;
                // Hold at 99% until complete call resolves
                const overallPercent = Math.min(Math.round((totalUploaded / file.size) * 100), 99);

                set({
                  uploadedBytes: totalUploaded,
                  uploadProgress: overallPercent,
                  uploadSpeed: currentSpeed,
                });
              }
            };

            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                const etag = xhr.getResponseHeader("ETag");
                // Backblaze returns ETag enclosed in quotes, which is standard S3
                if (!etag) {
                  reject(new Error(`No ETag returned for part ${partNumber}`));
                  return;
                }
                
                partETags.push({
                  ETag: etag.replace(/"/g, ""), // clean surrounding quotes
                  PartNumber: partNumber,
                });

                // Remove XHR from active list
                set((state) => ({
                  activeXHRs: state.activeXHRs.filter((x) => x !== xhr),
                }));
                
                completedPartsCount++;
                resolve();
              } else {
                reject(new Error(`Part ${partNumber} upload failed with status ${xhr.status}`));
              }
            };

            xhr.onerror = () => reject(new Error(`Network error uploading part ${partNumber}`));

            xhr.open("PUT", signedUrl);
            xhr.setRequestHeader("Content-Type", "application/octet-stream");
            xhr.send(partBlob);
          });
        };

        // Queue worker to run up to MAX_CONCURRENT_UPLOADS in parallel
        let activeIndex = 0;
        const uploadQueue = async (): Promise<void> => {
          const promises: Promise<void>[] = [];
          
          const worker = async () => {
            while (activeIndex < numParts) {
              const myIndex = activeIndex++;
              await uploadPart(myIndex);
            }
          };

          for (let i = 0; i < Math.min(MAX_CONCURRENT_UPLOADS, numParts); i++) {
            promises.push(worker());
          }

          await Promise.all(promises);
        };

        // Execute all part uploads
        await uploadQueue();

        // 3. Complete the multipart upload session
        console.log("All parts uploaded, completing session...");
        const completeRes = await fetch("/api/upload/multipart/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uploadId,
            key,
            filename: file.name,
            fileSize: file.size,
            parts: partETags,
          }),
        });

        if (!completeRes.ok) {
          const errData = await completeRes.json();
          throw new Error(errData.error || "Failed to finalize multipart upload");
        }

        // Add to cart on success
        const cleanFinish = options.finish.replace(/\s*\[File:\s*.*?\]/, "");
        useCartStore.getState().addItem({
          ...options,
          finish: `${cleanFinish} [File: ${key}]`,
          storagePath: key,
        });

        set({
          uploadStatus: "success",
          uploadProgress: 100,
          activeXHRs: [],
        });
        toast.success(`"${file.name}" added to cart!`);
      }
    } catch (err: any) {
      console.error("Multipart/Parallel upload workflow failed:", err);
      const errMsg = err.message || "Upload failed.";
      
      // Abort clean up
      get().abortUpload();
      
      set({
        uploadStatus: "error",
        uploadError: errMsg,
      });
      toast.error(`Upload failed: ${errMsg}`);
    }
  },
}));
