(function () {
  if (typeof document === 'undefined') return;

  const STAGES_DEF = [
    { key: 'diagnostico', num: '01', name: 'Diagnóstico', desc: 'Business MRI™' },
    { key: 'estrategia', num: '02', name: 'Estrategia', desc: 'Plan y Objetivos' },
    { key: 'implementacion', num: '03', name: 'Ejecución', desc: 'Web + CRM + WhatsApp' },
    { key: 'validacion', num: '04', name: 'Validación', desc: 'Pruebas Operativas' },
    { key: 'entrega', num: '05', name: 'Entrega', desc: 'VEYRA Care Continuo' },
  ];

  const STAGE_ORDER = ['diagnostico', 'estrategia', 'implementacion', 'validacion', 'entrega'];

  document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id') || urlParams.get('token') || 'PRJ-001';

    async function loadProject() {
      try {
        const res = await fetch(`/api/veyra/projects/${projectId}`);
        if (!res.ok) throw new Error('No se pudo cargar el proyecto.');
        const data = await res.json();
        const project = data.project;
        if (!project) return;

        // Render Title & Metadata
        const nameEl = document.getElementById('projectName');
        if (nameEl) nameEl.textContent = project.companyName || 'Proyecto';

        const metaEl = document.getElementById('clientMeta');
        if (metaEl) {
          metaEl.innerHTML = `Cliente: <strong>${project.clientName}</strong> · Token de Seguridad: <span style="font-family:'JetBrains Mono',monospace;color:var(--swiss-black);font-weight:700;">${project.token}</span>`;
        }

        // Render Stages
        const currentIdx = STAGE_ORDER.indexOf(project.currentStage || 'diagnostico');
        const stagesContainer = document.getElementById('stagesContainer');
        if (stagesContainer) {
          stagesContainer.innerHTML = STAGES_DEF.map((stg, idx) => {
            let statusClass = '';
            let statusLabel = '⚪ PENDIENTE';
            let statusColor = '#999';

            if (idx < currentIdx) {
              statusClass = 'completed';
              statusLabel = '✔ COMPLETADO';
              statusColor = 'var(--swiss-emerald)';
            } else if (idx === currentIdx) {
              statusClass = 'active';
              statusLabel = `⚡ EN PROGRESO (${project.stageProgress || 50}%)`;
              statusColor = 'var(--swiss-accent-orange)';
            }

            return `
              <div class="stage-card ${statusClass}">
                <div class="stage-status" style="color:${statusColor};">${statusLabel}</div>
                <div class="stage-name">${stg.num}. ${stg.name}</div>
                <div class="stage-desc">${stg.desc}</div>
              </div>
            `;
          }).join('');
        }

        const stageCounter = document.getElementById('stageCounter');
        if (stageCounter) {
          stageCounter.textContent = `FASE 0${Math.min(5, currentIdx + 1)} / 05`;
        }

        // Render Daily Done
        const doneList = document.getElementById('dailyDoneList');
        if (doneList && Array.isArray(project.dailyDone)) {
          doneList.innerHTML = project.dailyDone.map((item) => `<li>✔ ${item}</li>`).join('');
        }

        // Render Daily Next
        const nextList = document.getElementById('dailyNextList');
        if (nextList && Array.isArray(project.dailyNext)) {
          nextList.innerHTML = project.dailyNext.map((item) => `<li>→ ${item}</li>`).join('');
        }

        // Render Live Progress Logs
        const logsContainer = document.getElementById('progressLogsContainer');
        if (logsContainer && Array.isArray(project.progressLogs)) {
          logsContainer.innerHTML = project.progressLogs.map((log) => `
            <div class="log-item">
              <span class="log-time">${log.time}</span>
              <div>
                <strong>${log.author}:</strong> ${log.message}
              </div>
            </div>
          `).join('');
        }

        // Render Approval Box
        const approvalTitle = document.getElementById('approvalTitle');
        const approvalDesc = document.getElementById('approvalDesc');
        const optionsContainer = document.getElementById('approvalOptionsContainer');
        const submitBtn = document.getElementById('submitApprovalBtn');
        const approvalStatus = document.getElementById('approvalStatus');

        if (project.pendingApproval) {
          const app = project.pendingApproval;
          if (approvalTitle) approvalTitle.textContent = app.title;
          if (approvalDesc) approvalDesc.textContent = app.description;

          if (optionsContainer && Array.isArray(app.options)) {
            optionsContainer.innerHTML = app.options.map((opt, i) => `
              <label class="opt-box">
                <input type="radio" name="project_decision_opt" value="${opt.id}" ${i === 0 || app.selectedOption === opt.id ? 'checked' : ''} ${app.approved ? 'disabled' : ''}>
                <div>
                  <strong style="font-size:13px;display:block;">${opt.label}</strong>
                  <span style="font-size:11px;color:#666;">${opt.desc}</span>
                </div>
              </label>
            `).join('');
          }

          if (submitBtn) {
            if (app.approved) {
              submitBtn.setAttribute('disabled', 'true');
              submitBtn.textContent = `Aprobado con éxito (${app.selectedOption}) ✔`;
              if (approvalStatus) {
                approvalStatus.textContent = `✔ Aprobación registrada el ${new Date(app.approvedAt || Date.now()).toLocaleTimeString('es-CO')}.`;
                approvalStatus.removeAttribute('hidden');
              }
            } else {
              submitBtn.removeAttribute('disabled');
              submitBtn.textContent = 'APROBAR DECISIÓN SELECCIONADA ✔';
            }
          }
        }

        // Render Impact Scores
        const beforeEl = document.getElementById('beforeScore');
        if (beforeEl) beforeEl.innerHTML = `${project.beforeScore || 42}<span style="font-size:18px;">/100</span>`;

        const afterEl = document.getElementById('afterScore');
        if (afterEl) afterEl.innerHTML = `${project.afterScore || 76}<span style="font-size:18px;">/100</span>`;

        // Render Care
        if (project.veyraCare) {
          const careTitle = document.getElementById('careTitle');
          if (careTitle) careTitle.textContent = `🛡️ VEYRA CARE: ${project.veyraCare.plan.toUpperCase()}`;
          const careDesc = document.getElementById('careDesc');
          if (careDesc) careDesc.textContent = `Próxima auditoría programada: ${project.veyraCare.nextAuditDate} · Monitoreo continuo de infraestructura y conversiones.`;
        }
      } catch (err) {
        console.error('Error cargando proyecto en portal:', err);
      }
    }

    // Handle Approval Submission
    const submitBtn = document.getElementById('submitApprovalBtn');
    if (submitBtn) {
      submitBtn.addEventListener('click', async () => {
        const selected = document.querySelector('input[name="project_decision_opt"]:checked');
        if (!selected) return;

        submitBtn.setAttribute('disabled', 'true');
        submitBtn.textContent = 'Enviando aprobación…';

        try {
          const res = await fetch(`/api/veyra/projects/${projectId}/approval`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              approvalKey: 'APR-001',
              selectedOption: (selected as HTMLInputElement).value,
            }),
          });

          if (res.ok) {
            await loadProject();
          } else {
            submitBtn.removeAttribute('disabled');
            submitBtn.textContent = 'Reintentar aprobación';
          }
        } catch {
          await loadProject();
        }
      });
    }

    await loadProject();
  });
})();
