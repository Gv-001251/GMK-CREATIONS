"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { UploadFile } from "@/components/upload-file";
import { useCartStore } from "@/lib/store/cart-store";
import { useAuthStore } from "@/lib/store/auth-store";
import { materials, Material } from "@/lib/data/materials";
import { finishes } from "@/lib/data/materials";
import { Minus, Plus, ShoppingCart, Calculator, Box, Weight, Layers, Percent, Clock, Loader2 } from "lucide-react";
import { STLAnalysis } from "@/lib/utils/stl-parser";
import Link from "next/link";

// Print speed estimate: ~30 cm³/hr for FDM printing
const PRINT_SPEED_CM3_PER_HR = 30;
const PRINT_TIME_COST_PER_HR = 20; // ₹20 per hour
const MIN_INFILL = 5;
const MAX_INFILL = 80;

const finishMultipliers: Record<string, number> = {
  matte: 1.0,
  satin: 1.0,
  gloss: 1.15,
  raw: 0.9,
  metallic: 1.3,
  translucent: 1.15,
};

export default function UploadPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<STLAnalysis | null>(null);
  const [scalePercent, setScalePercent] = useState(100); // default 100%
  const [unit, setUnit] = useState<"mm" | "cm" | "inch">("mm");
  const [activeInput, setActiveInput] = useState<"x" | "y" | "z" | null>(null);
  const [widthInput, setWidthInput] = useState("");
  const [depthInput, setDepthInput] = useState("");
  const [heightInput, setHeightInput] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState(materials[0].id);
  const [selectedFinish, setSelectedFinish] = useState(finishes[0].id);
  const [quantity, setQuantity] = useState(1);
  const [infillPercent, setInfillPercent] = useState(20); // default 20%
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  // Synchronize dimension input text fields with scalePercent and unit
  useEffect(() => {
    if (analysis) {
      const scaleMultiplier = scalePercent / 100;
      const mmToUnit = unit === "cm" ? 0.1 : unit === "inch" ? 1 / 25.4 : 1;
      const decimals = unit === "mm" ? 1 : 2;
      
      if (activeInput !== "x") {
        setWidthInput((analysis.dimensions.x * scaleMultiplier * mmToUnit).toFixed(decimals));
      }
      if (activeInput !== "y") {
        setDepthInput((analysis.dimensions.y * scaleMultiplier * mmToUnit).toFixed(decimals));
      }
      if (activeInput !== "z") {
        setHeightInput((analysis.dimensions.z * scaleMultiplier * mmToUnit).toFixed(decimals));
      }
    }
  }, [scalePercent, unit, analysis, activeInput]);

  const handleDimensionChange = (dimension: "x" | "y" | "z", valueStr: string) => {
    // Allow typing decimals and numbers
    if (dimension === "x") setWidthInput(valueStr);
    if (dimension === "y") setDepthInput(valueStr);
    if (dimension === "z") setHeightInput(valueStr);

    const val = parseFloat(valueStr);
    if (isNaN(val) || val <= 0 || !analysis) return;

    // Convert target dimension in current unit back to millimeters
    const unitToMm = unit === "cm" ? 10 : unit === "inch" ? 25.4 : 1;
    const targetMm = val * unitToMm;

    // Calculate new scale factor
    const originalMm = analysis.dimensions[dimension];
    if (originalMm <= 0) return;

    let newScale = (targetMm / originalMm) * 100;
    
    // Clamp scale factor between 1% and 500%
    newScale = Math.min(Math.max(newScale, 1), 500);
    
    setScalePercent(Number(newScale.toFixed(1)));
  };

  const selectedMaterialData = materials.find((m) => m.id === selectedMaterial) as Material;
  
  // ─── Dynamic volume-based pricing ───────────────────────────────
  let volumeCm3 = 0;
  let filledVolumeCm3 = 0;
  let estimatedWeightG = 0;
  let estimatedPrintTimeHrs = 0;
  let materialCost = 0;
  let printTimeCost = 0;
  let calculatedUnitPrice = 399.00; // Fallback default price

  if (analysis && selectedMaterialData) {
    const scaleMultiplier = scalePercent / 100;
    const volumeMultiplier = Math.pow(scaleMultiplier, 3);

    // Volume is in mm³, convert to cm³ and apply scale multiplier
    volumeCm3 = (analysis.volume / 1000) * volumeMultiplier;
    
    // Account for infill (outer shell is always ~100%, inner uses infill %)
    // Rough model: ~20% shell volume + (infill% × 80% inner volume)
    const shellFraction = 0.20;
    const innerFraction = 1 - shellFraction;
    const effectiveFill = shellFraction + (infillPercent / 100) * innerFraction;
    filledVolumeCm3 = volumeCm3 * effectiveFill;

    // Weight based on filled volume × material density
    estimatedWeightG = filledVolumeCm3 * selectedMaterialData.density;

    // Material cost = weight × cost per gram
    materialCost = estimatedWeightG * selectedMaterialData.costPerGram;

    // Estimate print time based on filled volume
    estimatedPrintTimeHrs = filledVolumeCm3 / PRINT_SPEED_CM3_PER_HR;
    if (estimatedPrintTimeHrs < 0.5) estimatedPrintTimeHrs = 0.5; // minimum 30 min

    // Print time cost = hours × ₹20/hr
    printTimeCost = estimatedPrintTimeHrs * PRINT_TIME_COST_PER_HR;

    // Finish multiplier
    const finishMultiplier = finishMultipliers[selectedFinish] || 1.0;

    // Total = (material cost + print time cost) × finish multiplier
    calculatedUnitPrice = (materialCost + printTimeCost) * finishMultiplier;
  } else if (selectedMaterialData) {
    // Mock base estimate prior to uploading
    calculatedUnitPrice = 399.00 * selectedMaterialData.priceMultiplier;
  }

  const handleAddToCart = async () => {
    if (!uploadedFile) return;
    setIsUploading(true);
    setUploadError("");

    try {
      const res = await fetch(`/api/upload?filename=${encodeURIComponent(uploadedFile.name)}`, {
        method: "POST",
        body: uploadedFile,
        headers: {
          "Content-Type": "application/octet-stream",
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to upload file to storage");
      }

      const { path } = await res.json();
      
      // Calculate scaled dimensions
      const scaleMultiplier = scalePercent / 100;
      const dx = (analysis ? analysis.dimensions.x * scaleMultiplier : 0).toFixed(1);
      const dy = (analysis ? analysis.dimensions.y * scaleMultiplier : 0).toFixed(1);
      const dz = (analysis ? analysis.dimensions.z * scaleMultiplier : 0).toFixed(1);

      const sizeString = analysis 
        ? `${dx}×${dy}×${dz}mm`
        : "Custom Size";

      const weightString = estimatedWeightG > 0
        ? ` (${estimatedWeightG.toFixed(1)}g)`
        : "";

      const scaleString = scalePercent !== 100 ? ` [Scaled to ${scalePercent}%]` : "";

      addItem({
        productId: `custom-${Date.now()}`,
        name: `Custom Print: ${uploadedFile.name}${scaleString}`,
        price: calculatedUnitPrice,
        image: analysis?.thumbnail || "/images/hero-sphere.png",
        material: `${selectedMaterialData?.name || "PLA"}${weightString} @ ${infillPercent}% infill`,
        finish: `${finishes.find((f) => f.id === selectedFinish)?.name || "Matte"} (${sizeString})`,
        storagePath: path,
      });
    } catch (err) {
      console.error("Upload error:", err);
      setUploadError(err instanceof Error ? err.message : "Failed to upload model file.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main>
      <Navbar />

      <div className="pt-28 pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-medium text-primary uppercase tracking-widest">
              Custom Prints
            </span>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-on-surface mt-2 tracking-tight">
              Upload Your 3D Model
            </h1>
            <p className="text-on-surface-variant mt-3 leading-relaxed">
              Upload your .STL or .OBJ models directly. We provide instant material analysis, precision slicing, and a quick quote for your custom print.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Upload Area */}
            <div>
              <UploadFile 
                onFileUploaded={(file) => setUploadedFile(file)} 
                onAnalysisComplete={(results) => {
                  setAnalysis(results);
                  // Auto-scale check: if model's maximum dimension exceeds 300mm, scale down to 10%
                  const maxDim = Math.max(results.dimensions.x, results.dimensions.y, results.dimensions.z);
                  if (maxDim > 300) {
                    if (maxDim > 1000) {
                      setScalePercent(10);
                    } else if (maxDim > 500) {
                      setScalePercent(20);
                    } else {
                      setScalePercent(25);
                    }
                  } else {
                    setScalePercent(100);
                  }
                }}
                onRemoveFile={() => {
                  setUploadedFile(null);
                  setAnalysis(null);
                  setScalePercent(100);
                }}
              />

              {/* Scale & Dimensions Adjuster */}
              {analysis && (
                <div className="mt-8 p-6 rounded-2xl bg-surface-container-low border border-outline-variant animate-slide-down">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <h3 className="font-heading text-base font-bold text-on-surface">
                      Dimensions & Scale
                    </h3>
                    
                    {/* Unit Selector */}
                    <div className="flex bg-surface-container p-0.5 rounded-lg border border-outline-variant">
                      {(["mm", "cm", "inch"] as const).map((u) => (
                        <button
                          key={u}
                          type="button"
                          onClick={() => setUnit(u)}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${
                            unit === u
                              ? "bg-on-surface text-background shadow-sm"
                              : "text-on-surface-variant hover:text-on-surface"
                          }`}
                        >
                          {u === "inch" ? "in" : u}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Auto-scale alert banner if it was auto-scaled */}
                  {Math.max(analysis.dimensions.x, analysis.dimensions.y, analysis.dimensions.z) > 300 && scalePercent < 100 && (
                    <div className="mb-4 p-3 rounded-xl bg-amber-500/10 text-amber-600 text-xs font-medium flex items-center gap-2 border border-amber-500/20">
                      <span>💡 <strong>Auto-scaled:</strong> Model exceeds print volume. Auto-scaled to fit standard print beds.</span>
                    </div>
                  )}

                  {/* Dimension Inputs */}
                  <div className="mb-6">
                    <span className="text-xs font-semibold text-on-surface-variant block mb-2 uppercase tracking-wider">
                      Specify Target Dimensions <span className="text-[10px] text-primary lowercase font-normal">(🔒 proportions locked)</span>
                    </span>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] text-on-surface-variant font-medium block mb-1">Width (X)</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={widthInput}
                            onChange={(e) => handleDimensionChange("x", e.target.value)}
                            onFocus={() => setActiveInput("x")}
                            onBlur={() => setActiveInput(null)}
                            className="w-full pl-3 pr-7 py-2 rounded-xl bg-surface-container border border-outline-variant text-on-surface text-sm font-semibold outline-none focus:border-primary transition-all text-center"
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] text-on-surface-variant font-medium pointer-events-none">
                            {unit === "inch" ? "in" : unit}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] text-on-surface-variant font-medium block mb-1">Depth (Y)</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={depthInput}
                            onChange={(e) => handleDimensionChange("y", e.target.value)}
                            onFocus={() => setActiveInput("y")}
                            onBlur={() => setActiveInput(null)}
                            className="w-full pl-3 pr-7 py-2 rounded-xl bg-surface-container border border-outline-variant text-on-surface text-sm font-semibold outline-none focus:border-primary transition-all text-center"
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] text-on-surface-variant font-medium pointer-events-none">
                            {unit === "inch" ? "in" : unit}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] text-on-surface-variant font-medium block mb-1">Height (Z)</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={heightInput}
                            onChange={(e) => handleDimensionChange("z", e.target.value)}
                            onFocus={() => setActiveInput("z")}
                            onBlur={() => setActiveInput(null)}
                            className="w-full pl-3 pr-7 py-2 rounded-xl bg-surface-container border border-outline-variant text-on-surface text-sm font-semibold outline-none focus:border-primary transition-all text-center"
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] text-on-surface-variant font-medium pointer-events-none">
                            {unit === "inch" ? "in" : unit}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Scale slider */}
                  <div className="pt-4 border-t border-outline-variant">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                        Scale Factor
                      </span>
                      <span className="text-xs font-bold text-primary">
                        {scalePercent}%
                      </span>
                    </div>

                    <input
                      type="range"
                      min={5}
                      max={200}
                      value={scalePercent}
                      onChange={(e) => setScalePercent(Number(e.target.value))}
                      className="w-full accent-primary h-2 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${((scalePercent - 5) / (200 - 5)) * 100}%, var(--color-surface-container-highest) ${((scalePercent - 5) / (200 - 5)) * 100}%, var(--color-surface-container-highest) 100%)`,
                      }}
                      id="scale-slider"
                    />
                    <div className="flex justify-between mt-2 text-[10px] text-on-surface-variant font-medium">
                      <span>5%</span>
                      <span>100% (Original)</span>
                      <span>200%</span>
                    </div>

                    {/* Presets */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {[10, 25, 50, 100].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setScalePercent(preset)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                            scalePercent === preset
                              ? "bg-primary text-white"
                              : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                          }`}
                        >
                          {preset}% {preset === 10 ? "(10x Mode)" : preset === 100 ? "(Original)" : ""}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Material Selection */}
              <div className="mt-10">
                <h3 className="font-heading text-lg font-bold text-on-surface mb-4">
                  Select Material
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {materials.map((material) => (
                    <button
                      key={material.id}
                      onClick={() => setSelectedMaterial(material.id)}
                      className={`p-4 rounded-2xl text-left transition-all ${
                        selectedMaterial === material.id
                          ? "bg-primary/10 ring-2 ring-primary/30"
                          : "bg-surface-container-low hover:bg-surface-container"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-heading text-sm font-semibold text-on-surface">
                          {material.name}
                        </span>
                        <span className="text-xs text-primary font-medium">
                          ₹{material.costPerGram}/g
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {material.properties.map((prop) => (
                          <span
                            key={prop}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant"
                          >
                            {prop}
                          </span>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Infill Percentage */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading text-lg font-bold text-on-surface flex items-center gap-2">
                    <Percent className="w-4 h-4 text-primary" />
                    Infill Density
                  </h3>
                  <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                    {infillPercent}%
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-surface-container-low">
                  <input
                    type="range"
                    min={MIN_INFILL}
                    max={MAX_INFILL}
                    value={infillPercent}
                    onChange={(e) => setInfillPercent(Number(e.target.value))}
                    className="w-full accent-primary h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${((infillPercent - MIN_INFILL) / (MAX_INFILL - MIN_INFILL)) * 100}%, var(--color-surface-container-highest) ${((infillPercent - MIN_INFILL) / (MAX_INFILL - MIN_INFILL)) * 100}%, var(--color-surface-container-highest) 100%)`,
                    }}
                    id="infill-slider"
                  />
                  <div className="flex justify-between mt-2 text-[10px] text-on-surface-variant font-medium">
                    <span>{MIN_INFILL}% — Lightweight</span>
                    <span>Balanced</span>
                    <span>{MAX_INFILL}% — Strongest</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-3">
                    Higher infill = more material, stronger prints, higher cost. 15–20% is typical for decorative items; 50%+ for functional parts.
                  </p>
                </div>
              </div>

              {/* Finish Selection */}
              <div className="mt-8">
                <h3 className="font-heading text-lg font-bold text-on-surface mb-4">
                  Select Finish
                </h3>
                <div className="flex flex-wrap gap-2">
                  {finishes.map((finish) => (
                    <button
                      key={finish.id}
                      onClick={() => setSelectedFinish(finish.id)}
                      className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                        selectedFinish === finish.id
                          ? "bg-on-surface text-background"
                          : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                      }`}
                    >
                      {finish.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quote Summary */}
            <div>
              <div className="sticky top-28 p-8 rounded-2xl bg-surface-container-low">
                <div className="flex items-center gap-3 mb-6">
                  <Calculator className="w-5 h-5 text-primary" />
                  <h3 className="font-heading text-lg font-bold text-on-surface">
                    Instant Quote
                  </h3>
                </div>

                {/* Model Details Block (Rendered upon successful analysis) */}
                {analysis && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 p-4 rounded-xl bg-surface-container">
                    <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-surface-container-low text-center">
                      <Box className="w-4 h-4 text-primary mb-1" />
                      <span className="text-[10px] text-on-surface-variant uppercase font-semibold">Dimensions</span>
                      <span className="text-xs font-bold text-on-surface mt-0.5">
                        {(analysis.dimensions.x * (scalePercent / 100)).toFixed(1)}×
                        {(analysis.dimensions.y * (scalePercent / 100)).toFixed(1)}×
                        {(analysis.dimensions.z * (scalePercent / 100)).toFixed(1)}{" "}
                        <span className="text-[9px] font-normal text-on-surface-variant">mm</span>
                      </span>
                    </div>

                    <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-surface-container-low text-center">
                      <Weight className="w-4 h-4 text-primary mb-1" />
                      <span className="text-[10px] text-on-surface-variant uppercase font-semibold">Est. Weight</span>
                      <span className="text-xs font-bold text-on-surface mt-0.5">
                        {estimatedWeightG.toFixed(1)} <span className="text-[9px] font-normal text-on-surface-variant">g</span>
                      </span>
                    </div>

                    <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-surface-container-low text-center">
                      <Clock className="w-4 h-4 text-primary mb-1" />
                      <span className="text-[10px] text-on-surface-variant uppercase font-semibold">Print Time</span>
                      <span className="text-xs font-bold text-on-surface mt-0.5">
                        {estimatedPrintTimeHrs < 1 
                          ? `${Math.round(estimatedPrintTimeHrs * 60)} min`
                          : `${estimatedPrintTimeHrs.toFixed(1)} hrs`
                        }
                      </span>
                    </div>

                    <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-surface-container-low text-center">
                      <Layers className="w-4 h-4 text-primary mb-1" />
                      <span className="text-[10px] text-on-surface-variant uppercase font-semibold">Polygons</span>
                      <span className="text-xs font-bold text-on-surface mt-0.5">
                        {analysis.triangleCount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between">
                    <span className="text-sm text-on-surface-variant">File</span>
                    <span className="text-sm font-medium text-on-surface truncate max-w-[200px]">
                      {uploadedFile ? uploadedFile.name : "No file uploaded"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-on-surface-variant">Material</span>
                    <span className="text-sm font-medium text-on-surface">
                      {selectedMaterialData?.name} (₹{selectedMaterialData?.costPerGram}/g)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-on-surface-variant">Infill</span>
                    <span className="text-sm font-medium text-on-surface">
                      {infillPercent}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-on-surface-variant">Finish</span>
                    <span className="text-sm font-medium text-on-surface">
                      {finishes.find((f) => f.id === selectedFinish)?.name}
                    </span>
                  </div>
                  {analysis && scalePercent !== 100 && (
                    <div className="flex justify-between text-amber-500 font-medium">
                      <span className="text-sm">Scale</span>
                      <span className="text-sm">
                        {scalePercent}%
                      </span>
                    </div>
                  )}
                  {analysis && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-on-surface-variant">Volume (total)</span>
                        <span className="text-sm font-medium text-on-surface">
                          {volumeCm3.toFixed(2)} cm³
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-on-surface-variant">Filled Volume</span>
                        <span className="text-sm font-medium text-on-surface">
                          {filledVolumeCm3.toFixed(2)} cm³
                        </span>
                      </div>
                      <div className="border-t border-outline-variant pt-3 space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-on-surface-variant">Material Cost</span>
                          <span className="font-medium text-on-surface">
                            {estimatedWeightG.toFixed(1)}g × ₹{selectedMaterialData?.costPerGram} = ₹{materialCost.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-on-surface-variant">Print Time Cost</span>
                          <span className="font-medium text-on-surface">
                            {estimatedPrintTimeHrs < 1 
                              ? `${Math.round(estimatedPrintTimeHrs * 60)} min`
                              : `${estimatedPrintTimeHrs.toFixed(1)} hrs`
                            } × ₹{PRINT_TIME_COST_PER_HR}/hr = ₹{printTimeCost.toFixed(2)}
                          </span>
                        </div>
                        {(finishMultipliers[selectedFinish] || 1) !== 1 && (
                          <div className="flex justify-between text-xs">
                            <span className="text-on-surface-variant">Finish Multiplier</span>
                            <span className="font-medium text-on-surface">
                              ×{(finishMultipliers[selectedFinish] || 1).toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-on-surface-variant">Est. Production</span>
                    <span className="text-sm font-medium text-on-surface">5-7 Days</span>
                  </div>
                </div>

                {/* Quantity */}
                <div className="flex items-center justify-between mb-6 p-4 rounded-xl bg-surface-container">
                  <span className="text-sm font-medium text-on-surface">Quantity</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-1.5 hover:bg-surface-container-high rounded-full transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-1.5 hover:bg-surface-container-high rounded-full transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div className="flex justify-between items-center pt-4 border-t border-outline-variant mb-6">
                  <span className="font-heading font-bold text-lg">Estimated Price</span>
                  <span className="font-heading font-bold text-2xl text-primary">
                    ₹{(calculatedUnitPrice * quantity).toFixed(2)}
                  </span>
                </div>

                {uploadError && (
                  <div className="mb-4 p-3 rounded-xl bg-destructive/10 text-destructive text-xs font-semibold text-center border border-destructive/20 animate-slide-down">
                    ⚠️ {uploadError}
                  </div>
                )}

                {!isAuthenticated ? (
                  <Link
                    href="/login?redirect=/upload"
                    className="flex items-center justify-center gap-2 w-full py-4 rounded-full gradient-primary text-white font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all text-center"
                    id="add-custom-to-cart-login"
                  >
                    Sign In to Add to Cart
                  </Link>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    disabled={!uploadedFile || isUploading}
                    className="flex items-center justify-center gap-2 w-full py-4 rounded-full gradient-primary text-white font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    id="add-custom-to-cart"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading File...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        Add to Cart
                      </>
                    )}
                  </button>
                )}

                <p className="text-xs text-on-surface-variant text-center mt-4">
                  {analysis 
                    ? `Pricing: ₹${selectedMaterialData?.costPerGram}/g material + ₹${PRINT_TIME_COST_PER_HR}/hr print time, at ${infillPercent}% infill.` 
                    : "Base estimated price. Real-time pricing applies after upload."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
