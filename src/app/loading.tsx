export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0e0e12] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-[#2a2a35]" />
          <div className="absolute inset-0 rounded-full border-2 border-t-[#c9f455] animate-spin" />
        </div>
        <p className="text-[#a0a0b0] text-sm font-[family-name:var(--font-body)]">
          Loading...
        </p>
      </div>
    </div>
  );
}
