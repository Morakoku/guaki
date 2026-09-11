export interface VeyraIntakeRecord {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  city: string;
  sector: string;
  companySize?: string;
  priority?: string;
  goal: string;
  bottleneck: string;
  servicesNeeded?: string;
  systems?: string;
  budget?: string;
  status: 'pending_review' | 'diagnosed' | 'mri_generated' | 'client_interested' | 'meeting_scheduled' | 'active_project';
  createdAt: string;
}

export interface FindingItem {
  area: 'Presencia digital' | 'Captación' | 'Automatización' | 'Redes sociales' | 'Conversión';
  statusTone: 'red' | 'amber' | 'green';
  finding: string;
  impact: string;
  opportunity: string;
  evidence: string;
}

export interface StrategicObjective {
  id: string;
  number: string;
  title: string;
  services: string[];
}

export interface BusinessMriReport {
  id: string;
  intakeId: string;
  clientName: string;
  companyName: string;
  opportunityScore: number; // e.g. 78
  criticalProblemsCount: number; // e.g. 3
  importantOpportunitiesCount: number; // e.g. 2
  positiveAssetsCount: number; // e.g. 4
  currentSituation: {
    visibility: number; // e.g. 42
    conversion: number; // e.g. 31
    automation: number; // e.g. 18
    digitalPresence: number; // e.g. 56
  };
  comparisonToday: string[];
  comparisonTarget: string[];
  findings: FindingItem[];
  strategicObjectives: StrategicObjective[];
  status: 'pending_approval' | 'approved' | 'sent';
  approvedAt?: string;
  createdAt: string;
}

export interface ProgressLog {
  id: string;
  time: string;
  author: 'VEYRA' | 'CLIENTE';
  message: string;
  type: 'info' | 'milestone' | 'approval_req';
}

export interface ProjectApprovalItem {
  id: string;
  title: string;
  description: string;
  options: Array<{ id: string; label: string; desc: string }>;
  selectedOption?: string;
  approved: boolean;
  approvedAt?: string;
}

export interface VeyraClientProject {
  id: string;
  token: string;
  clientName: string;
  companyName: string;
  currentStage: 'diagnostico' | 'estrategia' | 'implementacion' | 'validacion' | 'entrega';
  stageProgress: number; // 0-100%
  beforeScore: number; // e.g. 42
  afterScore: number; // e.g. 76
  dailyDone: string[];
  dailyNext: string[];
  progressLogs: ProgressLog[];
  pendingApproval?: ProjectApprovalItem;
  deliverables: string[];
  veyraCare: {
    active: boolean;
    plan: string;
    nextAuditDate: string;
    monitoringItems: string[];
  };
  updatedAt: string;
  createdAt: string;
}

// Store in-memory for real incoming Veyra intakes & diagnostics (no mock/demo data)
let intakes: VeyraIntakeRecord[] = [];
let mriReports: BusinessMriReport[] = [];
let projects: VeyraClientProject[] = [];

export const VeyraStore = {
  // Intake operations
  getAllIntakes(): VeyraIntakeRecord[] {
    return [...intakes];
  },
  getIntakeById(id: string): VeyraIntakeRecord | null {
    return intakes.find((i) => i.id === id) ?? null;
  },
  createIntake(payload: Omit<VeyraIntakeRecord, 'id' | 'createdAt' | 'status'>): VeyraIntakeRecord & { report: BusinessMriReport } {
    const id = `INTK-${String(intakes.length + 1).padStart(3, '0')}`;
    const reportId = `MRI-${String(mriReports.length + 1).padStart(3, '0')}`;

    const newRecord: VeyraIntakeRecord = {
      ...payload,
      id,
      status: 'pending_review',
      createdAt: new Date().toISOString(),
    };
    intakes.unshift(newRecord);

    // AI Dynamic Diagnostic Generation based on user answers
    let comparisonToday = [
      `1. Prospecto busca servicios de ${payload.sector || 'tu sector'} en Google o redes.`,
      `2. Contacta por canales manuales (${payload.systems || 'WhatsApp / Correo'}) pero la respuesta demora.`,
      `3. Cuello de botella: ${payload.bottleneck || 'Falta de seguimiento automatizado y procesos manuales'}.`,
      `4. Resultado: Pérdida de oportunidades frente a competidores más ágiles.`,
    ];

    let comparisonTarget = [
      `1. Prospecto busca ➔ Encuentra a ${payload.companyName} con propuesta de alto valor.`,
      `2. Calificación inteligente en < 2 minutos orientada a: ${payload.goal || 'captar clientes calificados'}.`,
      `3. Flujo automatizado de agendamiento y trazabilidad en CRM centralizado.`,
      `4. Resultado: Aumento del 40%+ en tasa de conversión y control total de ventas.`,
    ];

    let findings: FindingItem[] = [
      {
        area: 'Captación',
        statusTone: 'red',
        finding: `Fricción en el canal de entrada: ${payload.bottleneck || 'Atención manual lenta'}.`,
        impact: `Pérdida estimada de prospectos calificados que buscan respuesta inmediata en ${payload.city || 'tu ciudad'}.`,
        opportunity: `Implementar embudo de conversión y filtro automático adaptado a ${payload.sector || 'tu industria'}.`,
        evidence: `Declarado en intake: ${payload.systems || 'Sistemas manuales'} · Prioridad: ${payload.priority || 'Alta'}.`,
      },
      {
        area: 'Automatización',
        statusTone: 'amber',
        finding: `Operación dependiente de gestión manual en ${payload.systems || 'hojas de cálculo o chat'}.`,
        impact: `Horas de trabajo manual del equipo dedicadas a tareas repetitivas sin trazabilidad.`,
        opportunity: `Automatización de flujos y sincronización directa con CRM.`,
        evidence: `Presupuesto estimado: ${payload.budget || 'Por definir'}.`,
      },
    ];

    let strategicObjectives: StrategicObjective[] = [
      {
        id: 'OBJ-01',
        number: 'OBJETIVO 01',
        title: `OPTIMIZACIÓN DE CAPTACIÓN Y CONVERSIÓN`,
        services: ['ARQUITECTURA WEB', 'PRECALIFICADOR INTELIGENTE', 'CRM INTEGRADO'],
      },
      {
        id: 'OBJ-02',
        number: 'OBJETIVO 02',
        title: `AUTOMATIZACIÓN DE RESPUESTA Y SEGUIMIENTO`,
        services: ['WHATSAPP API', 'SEGUIMIENTO AUTOMATIZADO', 'REDUCCIÓN DE FRICCIÓN'],
      },
    ];

    const newReport: BusinessMriReport = {
      id: reportId,
      intakeId: id,
      clientName: payload.name,
      companyName: payload.companyName,
      opportunityScore: 79,
      criticalProblemsCount: 2,
      importantOpportunitiesCount: 2,
      positiveAssetsCount: 3,
      currentSituation: {
        visibility: 45,
        conversion: 35,
        automation: 20,
        digitalPresence: 50,
      },
      comparisonToday,
      comparisonTarget,
      findings,
      strategicObjectives,
      status: 'pending_approval',
      createdAt: new Date().toISOString(),
    };

    mriReports.unshift(newReport);

    return Object.assign(newRecord, { report: newReport });
  },

  // Business MRI Report operations
  getAllMriReports(): BusinessMriReport[] {
    return [...mriReports];
  },
  getMriReportById(id: string): BusinessMriReport | null {
    return mriReports.find((r) => r.id === id || r.intakeId === id) ?? null;
  },
  approveMriReport(id: string): BusinessMriReport | null {
    const index = mriReports.findIndex((r) => r.id === id);
    if (index === -1) return null;
    mriReports[index].status = 'approved';
    mriReports[index].approvedAt = new Date().toISOString();
    return mriReports[index];
  },

  // Project operations
  getAllProjects(): VeyraClientProject[] {
    return [...projects];
  },
  getProjectByToken(token: string): VeyraClientProject | null {
    return projects.find((p) => p.token === token) ?? null;
  },
  approveProjectOption(token: string, approvalId: string, selectedOption: string): VeyraClientProject | null {
    const project = projects.find((p) => p.token === token);
    if (!project || !project.pendingApproval || project.pendingApproval.id !== approvalId) return null;

    project.pendingApproval.selectedOption = selectedOption;
    project.pendingApproval.approved = true;
    project.pendingApproval.approvedAt = new Date().toISOString();

    project.progressLogs.push({
      id: `LOG-${project.progressLogs.length + 1}`,
      time: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false }),
      author: 'CLIENTE',
      message: `Aprobada la decisión: ${selectedOption}.`,
      type: 'info',
    });

    project.updatedAt = new Date().toISOString();
    return project;
  },
};
