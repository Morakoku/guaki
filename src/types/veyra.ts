export interface VeyraDiagnosticFinding {
  area: string;
  finding: string;
  impact: string;
  evidence: string;
  statusTone: 'red' | 'amber' | 'green';
}

export interface VeyraDiagnosticReport {
  id: string;
  clientName: string;
  companyName: string;
  opportunityScore: number;
  status: 'pending' | 'approved';
  currentSituation: {
    digitalPresence: number;
    conversion: number;
    automation: number;
  };
  findings: VeyraDiagnosticFinding[];
}
