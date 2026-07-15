"use client";

import Image from "next/image";
import localFont from "next/font/local";
import { Great_Vibes } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const scriptFont = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
});

const ferron = localFont({
  src: "../../../public/images/font/Ferron-Regular.otf",
});



export default function PortfolioPage() {
  return (
    <main className="bg-black min-h-screen text-white flex flex-col">
      <Navbar />

      <div className="pt-32 pb-24 px-4 sm:px-6 max-w-[1400px] mx-auto w-full flex-1 flex flex-col items-center">
        {/* Left-aligned Hero Block */}
        <div className="w-full max-w-[950px] flex flex-col items-start text-left mt-8 sm:mt-12 px-4">
          <div className="relative select-none leading-none">
            <h1 className={`${ferron.className} text-5xl sm:text-7xl md:text-8xl lg:text-[9rem] xl:text-[10rem] text-white tracking-[0.06em] leading-[0.9] select-none uppercase font-normal`}>
              G. MANOJ
            </h1>
            <h1 className={`${ferron.className} text-5xl sm:text-7xl md:text-8xl lg:text-[9rem] xl:text-[10rem] text-white tracking-[0.06em] leading-[0.9] select-none uppercase font-normal`}>
              KANNAN
            </h1>
            {/* Overlay stylish cursive text */}
            <span 
              className={`${scriptFont.className} absolute z-20 text-blue-500 text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-normal select-none pointer-events-none -rotate-6 left-[20%] sm:left-[22%] top-[33%] tracking-wide whitespace-nowrap`}
              style={{ textShadow: "0 0 15px rgba(0,0,0,0.9)" }}
            >
              GMK &nbsp; &nbsp; Creations
            </span>
          </div>
        </div>

        {/* Profile/Bio Description (aligned to left max-w-[950px]) */}
        <div className="w-full max-w-[950px] text-left mt-10 mb-16 px-4">
          <p className="font-mono text-xs sm:text-sm text-slate-400 leading-relaxed tracking-wider">
            I believe every great idea deserves the opportunity to become a reality.<br className="hidden sm:inline" />
            As the Founder of <strong className="text-white font-bold">GMK 3D CREATIONS</strong> and a Mechanical Engineer, I am dedicated to pushing the boundaries of additive manufacturing by delivering innovative, high-quality 3D printing solutions that inspire creators, businesses, and innovators alike.
          </p>
        </div>

        {/* Blue Frame & Profile Photo Bleedout */}
        <div className="relative w-full max-w-[950px] aspect-[16/8.5] sm:aspect-[16/7.5] md:aspect-[16/7] flex items-end justify-center mb-22 overflow-visible px-4 sm:px-0 -translate-y-12">
          {/* Blue background block */}
          <div className="absolute bottom-0 left-4 right-4 sm:left-0 sm:right-0 h-[76%] bg-[#0866ff] z-0 rounded-none shadow-xl" />
          
          {/* Profile image container bleeding out */}
          <div className="absolute bottom-0 h-[122%] w-[280px] sm:w-[480px] md:w-[580px] lg:w-[680px] z-10 overflow-visible flex items-end justify-center -translate-x-12">
            <Image
              src="/images/manojkannan.png"
              alt="G. Manoj Kannan Profile"
              fill
              className="object-contain object-bottom pointer-events-none select-none"
              priority
              unoptimized
            />
          </div>
        </div>

        {/* Technologies I Use Section */}
        <div className="w-full flex flex-col items-center mb-12">
          <h2 className={`${ferron.className} text-3xl sm:text-4xl md:text-5xl text-white tracking-[0.18em] text-center uppercase font-normal mb-16`}>
            TECHNOLOGIES I USE
          </h2>
          
          {/* Logos Row */}
          <div className="flex flex-wrap items-center justify-center gap-10 sm:gap-12 md:gap-16 w-full max-w-5xl px-4 py-8">
            {/* AutoCAD */}
            <div className="flex items-center justify-center flex-shrink-0">
              <img 
                src="/images/logos/AutoCAD.svg" 
                className="h-10 sm:h-11 object-contain hover:scale-105 transition-transform duration-300 select-none" 
                alt="AutoCAD" 
              />
            </div>

            {/* SolidWorks */}
            <div className="flex items-center justify-center flex-shrink-0">
              <img 
                src="/images/logos/solidworks.svg" 
                className="h-8 sm:h-9 object-contain hover:scale-105 transition-transform duration-300 select-none" 
                alt="SolidWorks" 
              />
            </div>

            {/* Blender */}
            <div className="flex items-center justify-center flex-shrink-0">
              <img 
                src="/images/logos/blender.svg" 
                className="h-7 sm:h-8 object-contain hover:scale-105 transition-transform duration-300 select-none" 
                alt="Blender" 
              />
            </div>

            {/* ZBrush */}
            <div className="flex items-center justify-center flex-shrink-0">
              <img 
                src="/images/logos/zbrush.svg" 
                className="h-5.5 sm:h-6.5 object-contain invert brightness-[2] hover:scale-105 transition-transform duration-300 select-none" 
                alt="ZBrush" 
              />
            </div>

            {/* Autodesk Fusion 360 */}
            <div className="flex items-center gap-2.5 flex-shrink-0 hover:scale-105 transition-transform duration-300 select-none">
              <img 
                src="/images/logos/autodesk-fusion-360-icon.svg" 
                className="h-6.5 sm:h-7.5 object-contain" 
                alt="Fusion 360" 
              />
              <div className="flex flex-col text-left leading-none font-sans">
                <span className="text-[7.5px] sm:text-[8px] font-bold text-white tracking-widest uppercase">AUTODESK</span>
                <span className="text-[11.5px] sm:text-[12px] font-black text-white tracking-wider uppercase mt-0.5">FUSION 360</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
