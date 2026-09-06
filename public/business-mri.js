(function () {
  function clean(value) {
    return typeof value === 'string' ? value.trim() : '';
  }

  function buildBusinessMriPayload(values) {
    const sections = [
      ['Empresa', clean(values.company)],
      ['Teléfono/WhatsApp', clean(values.phone)],
      ['Sector', clean(values.sector)],
      ['Ciudad', clean(values.city)],
      ['Tamaño equipo', clean(values.company_size)],
      ['Prioridad', clean(values.priority)],
      ['Resultado buscado', clean(values.goal)],
      ['Cuello de botella', clean(values.bottleneck)],
      ['Servicios de interés', clean(values.services_needed)],
      ['Sistemas actuales', clean(values.systems)],
      ['Presupuesto estimado', clean(values.budget)],
    ].filter(([, value]) => value);

    return {
      name: clean(values.name),
      email: clean(values.email),
      phone: clean(values.phone),
      company_name: clean(values.company),
      city: clean(values.city),
      sector: clean(values.sector),
      goal: clean(values.goal),
      bottleneck: clean(values.bottleneck),
      company_size: clean(values.company_size),
      priority: clean(values.priority),
      services_needed: clean(values.services_needed),
      systems: clean(values.systems),
      budget: clean(values.budget),
      company_process: sections.map(([label, value]) => `${label}: ${value}`).join('\n'),
    };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { buildBusinessMriPayload };
  }

  if (typeof document === 'undefined') return;

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('businessMriForm');
    if (!form) return;

    const steps = Array.from(form.querySelectorAll('[data-step]'));
    const progress = document.getElementById('businessMriProgress');
    const response = document.getElementById('businessMriResponse');
    const back = document.getElementById('businessMriBack');
    const next = document.getElementById('businessMriNext');
    const submit = document.getElementById('businessMriSubmit');
    let currentStep = 0;

    function showStep(index) {
      currentStep = index;
      steps.forEach((step, position) => {
        step.hidden = position !== currentStep;
      });
      progress.textContent = `Paso ${currentStep + 1} de ${steps.length}`;
      back.hidden = currentStep === 0;
      next.hidden = currentStep === steps.length - 1;
      submit.hidden = currentStep !== steps.length - 1;
    }

    function currentStepIsValid() {
      const inputs = steps[currentStep].querySelectorAll('input[required], textarea[required], select[required]');
      return Array.from(inputs).every((input) => input.reportValidity());
    }

    next.addEventListener('click', () => {
      if (currentStepIsValid()) showStep(currentStep + 1);
    });
    back.addEventListener('click', () => showStep(currentStep - 1));

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!currentStepIsValid()) return;

      const values = Object.fromEntries(new FormData(form).entries());
      const payload = buildBusinessMriPayload(values);
      submit.disabled = true;
      submit.textContent = 'Procesando Business MRI™…';

      try {
        let endpoint = '/api/veyra/intake';
        let request = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Idempotency-Key': crypto.randomUUID(),
          },
          body: JSON.stringify(payload),
        });

        if (!request.ok) {
          endpoint = '/api/lead';
          request = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Idempotency-Key': crypto.randomUUID(),
            },
            body: JSON.stringify(payload),
          });
        }

        const result = await request.json();
        if (!request.ok || !result.success) throw new Error(result.error || 'No se pudo registrar la solicitud.');

        form.hidden = true;
        response.hidden = false;
        
        const reportLink = result.redirectUrl || (result.reportId ? `/business-mri-report.html?id=${result.reportId}` : `/business-mri-report.html?id=MRI-001`);
        
        response.innerHTML = `
          <div style="font-size:20px;font-weight:900;margin-bottom:8px;color:#0A0A0A;">✅ ¡DIAGNÓSTICO GENERADO EXITOSAMENTE!</div>
          <p style="margin:0 0 12px;color:#333;font-size:14px;">Hemos procesado la información para <strong>${payload.company_name}</strong> y generado la matriz estratégica inicial.</p>
          <div style="margin-top:20px;">
            <a href="${reportLink}" style="display:inline-block;padding:14px 28px;background:#FF5722;color:#ffffff;font-weight:900;text-decoration:none;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;border:2px solid #0A0A0A;box-shadow:4px 4px 0px #0A0A0A;">
              VER MI INFORME BUSINESS MRI™ ➔
            </a>
          </div>
        `;
      } catch (error) {
        response.hidden = false;
        response.textContent = error instanceof Error ? error.message : 'No se pudo registrar la solicitud.';
        response.dataset.status = 'error';
      } finally {
        submit.disabled = false;
        submit.textContent = 'Generar Business MRI™';
      }
    });

    showStep(0);
  });
})();
