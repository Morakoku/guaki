(function () {
  if (typeof document === 'undefined') return;

  document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const reportId = urlParams.get('id') || 'MRI-001';

    try {
      const res = await fetch(`/api/veyra/diagnostics/${reportId}`);
      if (!res.ok) throw new Error('No se pudo cargar el diagnóstico.');
      const data = await res.json();
      const report = data.report;
      if (!report) return;

      // 1. Headline & Lead
      const firstName = (report.clientName || 'EMPRESARIO').split(' ')[0].toUpperCase();
      const headline = document.getElementById('clientHeadline');
      if (headline) {
        headline.innerHTML = `${firstName}, <span class="red">TENEMOS QUE HABLAR</span> DE ESTO.`;
      }

      const lead = document.getElementById('clientLead');
      if (lead) {
        const totalPoints = (report.criticalProblemsCount || 0) + (report.importantOpportunitiesCount || 0);
        lead.innerHTML = `Detectamos ${totalPoints} puntos concretos que podrían estar limitando la capacidad de <strong style="color:var(--swiss-black);">${report.companyName}</strong> para conseguir nuevos clientes calificados e ingresos por Internet.`;
      }

      const metaId = document.getElementById('reportMetaId');
      if (metaId) {
        metaId.textContent = `REMITIDO POR: VEYRA AI COMMAND CENTER · ID: ${report.id}`;
      }

      // 2. Score & Breakdown
      const scoreNum = document.getElementById('opportunityScore');
      if (scoreNum) scoreNum.textContent = String(report.opportunityScore || 78);

      const crit = document.getElementById('critProblems');
      if (crit) crit.textContent = `🔴 ${report.criticalProblemsCount} PROBLEMAS CRÍTICOS`;

      const opps = document.getElementById('impOpps');
      if (opps) opps.textContent = `🟠 ${report.importantOpportunitiesCount} OPORTUNIDADES CLAVE`;

      const assets = document.getElementById('posAssets');
      if (assets) assets.textContent = `🟢 ${report.positiveAssetsCount} ACTIVOS A FAVOR`;

      // 3. Operational Maturity Charts
      if (report.currentSituation) {
        const cs = report.currentSituation;
        const setBar = (valId, fillId, val, defaultColor) => {
          const valEl = document.getElementById(valId);
          const fillEl = document.getElementById(fillId);
          if (valEl) valEl.textContent = `${val}/100`;
          if (fillEl) {
            fillEl.style.width = `${Math.min(100, Math.max(5, val))}%`;
            fillEl.style.background = val < 35 ? 'var(--swiss-red)' : val < 60 ? 'var(--swiss-accent-orange)' : 'var(--swiss-emerald)';
          }
        };

        setBar('visibilityVal', 'visibilityFill', cs.visibility || 40, 'var(--swiss-red)');
        setBar('conversionVal', 'conversionFill', cs.conversion || 30, 'var(--swiss-red)');
        setBar('automationVal', 'automationFill', cs.automation || 20, 'var(--swiss-accent-orange)');
        setBar('presenceVal', 'presenceFill', cs.digitalPresence || 50, 'var(--swiss-emerald)');
      }

      // 4. Comparison (Hoy vs Objetivo)
      const todayContainer = document.getElementById('compareTodayContainer');
      if (todayContainer && Array.isArray(report.comparisonToday)) {
        todayContainer.innerHTML = report.comparisonToday.map((item) => `<li>${item}</li>`).join('');
      }

      const targetContainer = document.getElementById('compareTargetContainer');
      if (targetContainer && Array.isArray(report.comparisonTarget)) {
        targetContainer.innerHTML = report.comparisonTarget.map((item) => `<li>${item}</li>`).join('');
      }

      // 5. Findings with Evidence
      const findingsContainer = document.getElementById('findingsContainer');
      if (findingsContainer && Array.isArray(report.findings)) {
        findingsContainer.innerHTML = report.findings.map((f, i) => {
          const isRed = f.statusTone === 'red';
          const isAmber = f.statusTone === 'amber';
          const bgTag = isRed ? '#FEE2E2' : isAmber ? '#FEF3C7' : '#DCFCE7';
          const colorTag = isRed ? 'var(--swiss-red)' : isAmber ? '#B45309' : 'var(--swiss-emerald)';
          const labelTag = isRed ? 'PROBLEMA CRÍTICO' : isAmber ? 'OPORTUNIDAD CLAVE' : 'ACTIVO A FAVOR';

          return `
            <div class="finding-card">
              <div class="finding-top">
                <div class="finding-title">0${i + 1} · ${f.area}</div>
                <span class="finding-status-tag" style="background:${bgTag};color:${colorTag};">${labelTag}</span>
              </div>
              <div class="finding-detail"><strong>Hallazgo:</strong> ${f.finding}</div>
              <div class="finding-detail"><strong>Impacto:</strong> ${f.impact}</div>
              <div class="finding-detail"><strong>Oportunidad:</strong> ${f.opportunity}</div>
              <span class="evidence-pill">[EVIDENCIA: ${f.evidence}]</span>
            </div>
          `;
        }).join('');
      }

      // 6. Strategic Objectives
      const objectivesContainer = document.getElementById('objectivesContainer');
      if (objectivesContainer && Array.isArray(report.strategicObjectives)) {
        objectivesContainer.innerHTML = report.strategicObjectives.map((obj) => `
          <div class="obj-card">
            <div>
              <div class="obj-num">${obj.number}</div>
              <div class="obj-title">${obj.title}</div>
            </div>
            <div class="obj-pills" style="margin-top:16px;">
              ${(obj.services || []).map((s) => `<span>${s}</span>`).join('')}
            </div>
          </div>
        `).join('');
      }

      // 7. CTA WhatsApp Link
      const ctaBtn = document.getElementById('ctaButton');
      if (ctaBtn) {
        const msg = encodeURIComponent(`Hola equipo VEYRA, estuve revisando el Business MRI de ${report.companyName} (ID: ${report.id}) y quiero coordinar la sesión estratégica.`);
        ctaBtn.href = `https://wa.me/573001234567?text=${msg}`;
      }
    } catch (err) {
      console.error('Error cargando Business MRI:', err);
    }
  });
})();
