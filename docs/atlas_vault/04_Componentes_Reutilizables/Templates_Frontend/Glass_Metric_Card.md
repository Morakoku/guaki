---
title: "Componente: Glass Metric Card (Next.js & Tailwind)"
type: componente_reutilizable
category: componente_nextjs
status: verificado
harvested_from_project: "Guaki Platform Core"
maintainer: "[[Equipo/Camila_UI_Specialist]]"
date_harvested: 2026-08-15
reusability_score: 5
tags:
  - componente
  - nextjs
  - glassmorphism
  - react
version: 1.0.0
---

# 📦 Componente: Glass Metric Card

```tsx
import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricProps {
  title: string;
  value: string;
  changePct: number;
  icon: React.ReactNode;
}

export const GlassMetricCard: React.FC<MetricProps> = ({ title, value, changePct, icon }) => {
  const isPositive = changePct >= 0;
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl transition-all duration-300 hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/10">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-400">{title}</p>
        <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">{icon}</div>
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        <h3 className="text-2xl font-bold tracking-tight text-white">{value}</h3>
        <span className={`inline-flex items-center text-xs font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isPositive ? <ArrowUpRight className="mr-0.5 h-3 w-3" /> : <ArrowDownRight className="mr-0.5 h-3 w-3" />}
          {Math.abs(changePct)}%
        </span>
      </div>
    </div>
  );
};
```
