---
title: "Playbook: Despliegue de Glass Dashboard en Next.js 14"
type: playbook_operativo
status: activo
domain: frontend
origin_project: "Guaki Platform Core"
author: "[[Equipo/Camila_UI_Specialist]]"
created: 2026-08-21
updated: 2026-08-21
estimated_execution_time_minutes: 30
difficulty_level: intermedio
tags:
  - playbook
  - frontend
  - nextjs
  - glassmorphism
  - tailwindcss
version: 1.0.0
---

# 📖 Playbook: Despliegue de Glass Dashboard en Next.js 14

## 🎯 Objetivo
Configurar y desplegar un panel administrativo estilo Neumorphic / Glassmorphism con TailwindCSS, Radix UI y suscripciones en tiempo real a Supabase.

## 🛠️ Procedimiento
1. **Creación del Proyecto:**
   ```bash
   npx create-next-app@latest client-dashboard --typescript --tailwind --app --use-pnpm
   ```
2. **Instalación de Iconografía y Componentes UI:**
   ```bash
   pnpm add lucide-react clsx tailwind-merge framer-motion @supabase/supabase-js
   ```
3. **Inyección de Tokens de Estilo Glass:**
   Configurar `tailwind.config.ts` con clases de desenfoque (`backdrop-blur-md`), bordes translúcidos (`border-white/10`) y fondos oscuros elegantes (`bg-slate-950/80`).
