import { PrinterLoaderSvg } from "@/components/printer-loader-svg";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center">
      <div className="w-[300px] h-[150px] flex items-center justify-center">
        <PrinterLoaderSvg />
      </div>
      <p className="text-white/60 text-xs tracking-widest font-heading uppercase animate-pulse mt-2">
        Loading...
      </p>
    </div>
  );
}
