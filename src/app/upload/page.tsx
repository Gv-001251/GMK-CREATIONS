"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { UploadFile } from "@/components/upload-file";
import { useCartStore } from "@/lib/store/cart-store";
import { materials } from "@/lib/data/materials";
import { finishes } from "@/lib/data/materials";
import { Minus, Plus, ShoppingCart, Calculator, ArrowRight } from "lucide-react";

export default function UploadPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState(materials[0].id);
  const [selectedFinish, setSelectedFinish] = useState(finishes[0].id);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCartStore();

  const selectedMaterialData = materials.find((m) => m.id === selectedMaterial);
  const basePrice = 49.99;
  const calculatedPrice = basePrice * (selectedMaterialData?.priceMultiplier || 1);

  const handleAddToCart = () => {
    if (!uploadedFile) return;
    addItem({
      productId: `custom-${Date.now()}`,
      name: `Custom Print: ${uploadedFile.name}`,
      price: calculatedPrice,
      image: "/images/hero-sphere.png",
      material: selectedMaterialData?.name || "",
      finish: finishes.find((f) => f.id === selectedFinish)?.name || "",
    });
  };

  return (
    <main>
      <Navbar />

      <div className="pt-28 pb-20 px-6">
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
              <UploadFile onFileUploaded={(file) => setUploadedFile(file)} />

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
                          {material.priceMultiplier}x
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
                      {selectedMaterialData?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-on-surface-variant">Finish</span>
                    <span className="text-sm font-medium text-on-surface">
                      {finishes.find((f) => f.id === selectedFinish)?.name}
                    </span>
                  </div>
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
                    ${(calculatedPrice * quantity).toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={!uploadedFile}
                  className="flex items-center justify-center gap-2 w-full py-4 rounded-full gradient-primary text-white font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  id="add-custom-to-cart"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>

                <p className="text-xs text-on-surface-variant text-center mt-4">
                  Price is estimated. Final quote after review.
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
