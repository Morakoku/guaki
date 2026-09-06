/**
 * VEYRA & LA TRINIDAD — OPERATIONAL TOOLS ENGINE
 * Implementación de los algoritmos de cálculo de ROI, Business MRI™,
 * Generador de Actas de Handover y Fábrica de Playbooks Post-Mortem.
 */

export interface MRICalculationInput {
  clientName: string;
  industry: string;
  monthlyLeads: number;
  averageTicketUsd: number;
  currentResponseTimeMinutes: number;
  weeklyManualHours: number;
  hourlyLaborCostUsd?: number;
  currentConversionRatePct: number;
}

export interface MRICalculationResult {
  clientName: string;
  industry: string;
  digitalMaturityScore: number; // 0-100
  maturityLevel: 'CRÍTICO' | 'BÁSICO' | 'INTERMEDIO' | 'AVANZADO';
  monthlyLeakageUsd: number;
  annualLeakageUsd: number;
  projectedNewConversionRatePct: number;
  projectedAnnualRevenueGainUsd: number;
  projectedAnnualHoursSaved: number;
  projectedAnnualLaborSavingsUsd: number;
  recommendedTier: {
    tierName: string;
    investmentUsd: number;
    timelineWeeks: number;
    roiMultiplier: number;
    paybackMonths: number;
  };
  markdownDiagnosis: string;
  markdownProposal: string;
}

export interface HandoverInput {
  clientName: string;
  contractTier: string;
  totalBudgetUsd: number;
  projectLead: string;
  clientRepresentative: string;
  clientEmail: string;
  clientPhone: string;
  servicesDelivered: string[];
}

export interface PostMortemInput {
  clientName: string;
  projectTitle: string;
  quotedHours: number;
  actualHours: number;
  quotedBudgetUsd: number;
  actualCostUsd: number;
  whatWentWell: string[];
  frictionPoints: string[];
  reusableComponents: Array<{
    name: string;
    type: string;
    description: string;
  }>;
  newPlaybookTitle: string;
  newPlaybookDomain: string;
}

export class VeyraToolsEngine {
  /**
   * 01 & 02: Calcula el Business MRI™ y genera la propuesta comercial
   */
  static calculateMRI(input: MRICalculationInput): MRICalculationResult {
    const hourlyCost = input.hourlyLaborCostUsd || 25; // Promedio $25 USD/hora con cargas
    const factorPrestacional = 1.5;
    const realHourlyCost = hourlyCost * factorPrestacional;

    // 1. Cálculo de Horas y Ahorro de Nómina
    // Automatizamos ~80% de las tareas manuales repetitivas
    const hoursSavedWeekly = input.weeklyManualHours * 0.8;
    const annualHoursSaved = hoursSavedWeekly * 52;
    const annualLaborSavingsUsd = annualHoursSaved * realHourlyCost;

    // 2. Fuga por Lentitud en Triage / Speed-to-Lead
    // Si tiempo de respuesta > 30 min, se asume pérdida de hasta el 35% de leads
    const speedLeakageRate = input.currentResponseTimeMinutes > 120 ? 0.35 : input.currentResponseTimeMinutes > 30 ? 0.20 : 0.08;
    const lostLeadsMonthly = input.monthlyLeads * speedLeakageRate;
    const lostDealsMonthly = lostLeadsMonthly * (input.currentConversionRatePct / 100);
    const lostRevenueMonthly = lostDealsMonthly * input.averageTicketUsd;

    const frictionLaborMonthly = (input.weeklyManualHours * 4.33) * realHourlyCost;
    const monthlyLeakageUsd = Math.round(lostRevenueMonthly + frictionLaborMonthly);
    const annualLeakageUsd = monthlyLeakageUsd * 12;

    // 3. Score de Madurez Digital (0-100)
    let score = 100;
    if (input.currentResponseTimeMinutes > 180) score -= 35;
    else if (input.currentResponseTimeMinutes > 30) score -= 20;
    else if (input.currentResponseTimeMinutes > 5) score -= 10;

    if (input.weeklyManualHours > 30) score -= 30;
    else if (input.weeklyManualHours > 15) score -= 18;
    else if (input.weeklyManualHours > 5) score -= 8;

    if (input.currentConversionRatePct < 5) score -= 20;
    else if (input.currentConversionRatePct < 15) score -= 10;

    const digitalMaturityScore = Math.max(15, Math.min(95, score));
    const maturityLevel = digitalMaturityScore < 45 ? 'CRÍTICO' : digitalMaturityScore < 70 ? 'BÁSICO' : digitalMaturityScore < 85 ? 'INTERMEDIO' : 'AVANZADO';

    // 4. Proyección de Mejora
    const conversionBoostMultiplier = digitalMaturityScore < 50 ? 1.4 : 1.25; // +25% a +40% de mejora
    const projectedNewConversionRatePct = Number((input.currentConversionRatePct * conversionBoostMultiplier).toFixed(1));
    const incrementalConversionsMonthly = (input.monthlyLeads * (projectedNewConversionRatePct - input.currentConversionRatePct)) / 100;
    const projectedAnnualRevenueGainUsd = Math.round(incrementalConversionsMonthly * input.averageTicketUsd * 12);

    // 5. Recomendación de Tier & ROI
    let investmentUsd = 4500;
    let tierName = 'Tier 2 — Transformación Operativa Integral (Full MRI + AI Stack)';
    let timelineWeeks = 6;

    if (annualLeakageUsd < 25000) {
      investmentUsd = 2500;
      tierName = 'Tier 1 — Sprint de Automatización (Quick Engine)';
      timelineWeeks = 3;
    } else if (annualLeakageUsd > 100000 || input.monthlyLeads > 1500) {
      investmentUsd = 8500;
      tierName = 'Tier 3 — Enterprise Custom Engine + Fractional CTO';
      timelineWeeks = 8;
    }

    const totalAnnualBenefit = annualLaborSavingsUsd + projectedAnnualRevenueGainUsd;
    const roiMultiplier = Number((totalAnnualBenefit / investmentUsd).toFixed(1));
    const paybackMonths = Number(((investmentUsd / (totalAnnualBenefit / 12))).toFixed(1));

    // 6. Generación de Markdown para Atlas Vault
    const markdownDiagnosis = `---
title: "Business MRI™ Diagnóstico: ${input.clientName}"
type: diagnostico_mri
status: evaluado
client: "[[00_Ficha_Cliente|${input.clientName}]]"
audit_date: ${new Date().toISOString().split('T')[0]}
digital_maturity_score: ${digitalMaturityScore}
maturity_level: "${maturityLevel}"
leakage_cost_usd_monthly: ${monthlyLeakageUsd}
tags:
  - diagnostico
  - mri
  - ${(input.industry || 'General').toLowerCase().replace(/\s+/g, '_')}
version: 1.0.0
---

# 🩺 Business MRI™ — ${input.clientName}

> [!IMPORTANT]
> **Score de Madurez Digital:** \`${digitalMaturityScore} / 100\` (${maturityLevel})  
> **Fuga de Capital Estimada:** \`$${monthlyLeakageUsd.toLocaleString()} USD / mes\` (\`$${annualLeakageUsd.toLocaleString()} USD / año\`).

---

## 🔬 Diagnóstico de 4 Pilares
- **Tiempo de Respuesta Actual:** ${input.currentResponseTimeMinutes} minutos *(Meta Veyra: < 45 seg)*.
- **Horas Manuales Semanales:** ${input.weeklyManualHours} hrs/semana.
- **Tasa de Conversión Base:** ${input.currentConversionRatePct}%.
- **Leads Mensuales:** ${input.monthlyLeads}.
`;

    const markdownProposal = `---
title: "Solution Blueprint: ${input.clientName}"
type: propuesta_comercial
status: enviada
client: "[[00_Ficha_Cliente|${input.clientName}]]"
investment_usd: ${investmentUsd}
projected_roi_multiplier: ${roiMultiplier}
payback_months: ${paybackMonths}
version: 1.0.0
---

# 📑 Solution Blueprint: ${input.clientName}

- **Plan Recomendado:** ${tierName}
- **Inversión Total:** $${investmentUsd.toLocaleString()} USD (Esquema 50/30/20)
- **Tiempo de Implementación:** ${timelineWeeks} semanas
- **ROI Proyectado:** ${roiMultiplier}x (${paybackMonths} meses de retorno)
- **Ahorro Anual Proyectado:** $${totalAnnualBenefit.toLocaleString()} USD
`;

    return {
      clientName: input.clientName,
      industry: input.industry || 'General',
      digitalMaturityScore,
      maturityLevel,
      monthlyLeakageUsd,
      annualLeakageUsd,
      projectedNewConversionRatePct,
      projectedAnnualRevenueGainUsd,
      projectedAnnualHoursSaved: Math.round(annualHoursSaved),
      projectedAnnualLaborSavingsUsd: Math.round(annualLaborSavingsUsd),
      recommendedTier: {
        tierName,
        investmentUsd,
        timelineWeeks,
        roiMultiplier,
        paybackMonths,
      },
      markdownDiagnosis,
      markdownProposal,
    };
  }

  /**
   * 03: Genera el Acta de Handover y el Payload de NPS
   */
  static generateHandover(input: HandoverInput) {
    const today = new Date().toISOString().split('T')[0];
    const initialPayment = input.totalBudgetUsd * 0.5;
    const corePayment = input.totalBudgetUsd * 0.3;
    const finalPayment = input.totalBudgetUsd * 0.2;

    const handoverMarkdown = `---
title: "Acta de Cierre y Entrega: ${input.clientName}"
type: acta_entrega
status: liquidado
client: "${input.clientName}"
date: ${today}
total_budget_usd: ${input.totalBudgetUsd}
tags:
  - handover
  - liquidacion
  - veyra
version: 1.0.0
---

# 🤝 Acta de Cierre de Proyecto y Recepción a Satisfacción

**Cliente:** ${input.clientName}  
**Representante:** ${input.clientRepresentative} (${input.clientEmail})  
**Líder de Proyecto Veyra:** ${input.projectLead}  
**Fecha:** ${today}

---

## 1. Servicios y Entregables Verificados
${input.servicesDelivered.map((s, i) => `${i + 1}. **${s}** — Entregado y Aprobado en QA.`).join('\\n')}

---

## 2. Liquidación Financiera 100%
- **Anticipo 50%:** $${initialPayment.toLocaleString()} USD — *Pagado*
- **Hito Core 30%:** $${corePayment.toLocaleString()} USD — *Pagado*
- **Liquidación Final 20%:** $${finalPayment.toLocaleString()} USD — *Pagado*

---

## 3. Garantía y Bóveda
- Bóveda de credenciales transferida vía Bitwarden/1Password.
- Garantía de soporte incluida por 30 días calendario (hasta ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}).
`;

    const npsSurveyUrl = `https://veyrasoluciones.com/nps?client=${encodeURIComponent(input.clientName)}&token=NPS-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    return {
      handoverMarkdown,
      npsSurveyUrl,
      npsWhatsAppPayload: {
        to: input.clientPhone,
        message: `Hola ${input.clientRepresentative.split(' ')[0]} 👋 ¡Felicitaciones por el lanzamiento oficial con Veyra!\\n\\nPara nosotros la excelencia es 100% prioritaria. ¿Qué tan probable es que recomiendes a Veyra en una escala del 0 al 10?\\n\\n👉 Responde aquí en 30 segundos: ${npsSurveyUrl}`,
      },
    };
  }

  /**
   * 04: Cosecha de Aprendizajes Post-Mortem y Síntesis de Playbook
   */
  static processPostMortem(input: PostMortemInput) {
    const today = new Date().toISOString().split('T')[0];
    const hoursVariancePct = Number((((input.actualHours - input.quotedHours) / input.quotedHours) * 100).toFixed(1));
    const costVariancePct = Number((((input.actualCostUsd - input.quotedBudgetUsd) / input.quotedBudgetUsd) * 100).toFixed(1));
    const marginPct = Number((((input.quotedBudgetUsd - input.actualCostUsd) / input.quotedBudgetUsd) * 100).toFixed(1));

    const postMortemMarkdown = `---
title: "Post-Mortem: ${input.projectTitle}"
type: postmortem_retrospectiva
status: estandarizado
client: "${input.clientName}"
date: ${today}
quoted_hours: ${input.quotedHours}
actual_hours: ${input.actualHours}
hours_variance_pct: ${hoursVariancePct}
margin_pct: ${marginPct}
playbook_harvested: true
version: 1.0.0
---

# 🔍 Retrospectiva Forense Post-Mortem — ${input.projectTitle}

- **Varianza en Horas:** \`${hoursVariancePct}%\` (${input.actualHours}h vs ${input.quotedHours}h cotizadas)
- **Margen Alcanzado:** \`${marginPct}%\`

## 🟢 Aciertos Clave
${input.whatWentWell.map((w) => `- ${w}`).join('\\n')}

## 🔴 Puntos de Fricción
${input.frictionPoints.map((f) => `- ${f}`).join('\\n')}

## 🌾 Componentes Cosechados
${input.reusableComponents.map((c) => `- **${c.name}** (\`${c.type}\`): ${c.description}`).join('\\n')}
`;

    const generatedPlaybookMarkdown = `---
title: "Playbook: ${input.newPlaybookTitle}"
type: playbook_operativo
status: activo
domain: "${input.newPlaybookDomain}"
origin_project: "${input.clientName}"
created: ${today}
tags:
  - playbook
  - veyra/operaciones
  - escala
version: 1.0.0
---

# 📖 Playbook: ${input.newPlaybookTitle}

> [!NOTE]
> Procedimiento generado automáticamente a partir del aprendizaje del proyecto **${input.projectTitle}**.

## 🎯 Objetivo
Estandarizar y acelerar futuras implementaciones de ${input.newPlaybookTitle}.

## 🛠️ Procedimiento Paso a Paso
1. **Configuración Inicial:** Aprovisionar dependencias y variables de entorno.
2. **Implementación del Módulo:** Inyectar componentes cosechados:
${input.reusableComponents.map((c) => `   - \`${c.name}\``).join('\\n')}
3. **Validación QA:** Ejecutar checklist 0% Cartón antes de pase a producción.
`;

    return {
      hoursVariancePct,
      costVariancePct,
      marginPct,
      postMortemMarkdown,
      generatedPlaybookMarkdown,
    };
  }
}
