"use client";

import { motion } from "framer-motion";

export interface MaterialItem {
  name: string;
  tag: string;
  desc: string;
  uses: string;
  strength: string;
  finish: string;
  color: string;
}

interface MaterialCardProps {
  material: MaterialItem;
  index: number;
}

export function MaterialCard({ material, index }: MaterialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      whileHover={{ scale: 1.008 }}
      className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/60 dark:border-zinc-800/60 p-6 md:p-8 flex flex-col md:grid md:grid-cols-12 items-center gap-6 shadow-sm hover:shadow-md transition-all duration-300"
    >
      {/* Left: Brand Identity */}
      <div className="flex items-center gap-5 md:col-span-4 lg:col-span-3 w-full">
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${material.color} flex items-center justify-center border font-heading text-xl font-black flex-shrink-0`}>
          {material.name}
        </div>
        <div className="min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10 block w-max">
            {material.tag}
          </span>
          <h3 className="font-heading text-lg font-extrabold text-slate-950 dark:text-white mt-1 truncate">
            {material.name} Filament
          </h3>
        </div>
      </div>

      {/* Center: Specs */}
      <div className="md:col-span-5 lg:col-span-6 md:px-6 lg:px-8 w-full">
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
          {material.desc}
        </p>
        <div className="mt-2 text-[11px] text-slate-600 dark:text-slate-300 font-semibold">
          <span className="text-slate-400 dark:text-slate-500">Best for:</span> {material.uses}
        </div>
      </div>

      {/* Right: Key Stats */}
      <div className="grid grid-cols-2 gap-4 text-left border-t md:border-t-0 md:border-l border-slate-100 dark:border-zinc-800 pt-4 md:pt-0 md:pl-6 lg:pl-8 md:col-span-3 lg:col-span-3 w-full">
        <div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block uppercase tracking-wider">Strength</span>
          <span className="text-sm font-extrabold text-slate-900 dark:text-white">{material.strength}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block uppercase tracking-wider">Finish</span>
          <span className="text-sm font-extrabold text-slate-900 dark:text-white">{material.finish}</span>
        </div>
      </div>
    </motion.div>
  );
}
