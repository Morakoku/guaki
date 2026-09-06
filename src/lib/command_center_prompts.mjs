const blueprints = {
  tenant: {
    objective: 'Verificar y completar el aislamiento de Mapache por tenant en entorno local.',
    checklist: ['identificar tenant y membresía verificables', 'revisar límites de acceso por usuario', 'crear o ejecutar pruebas de aislamiento'],
    done: 'PASS solo con evidencia reproducible de aislamiento; si falta identidad o RLS, registrar BLOCKED.',
  },
  search: {
    objective: 'Revisar el alcance de la búsqueda Veyra y dejarlo trazable para Mapache.',
    checklist: ['confirmar países, ciudades y sectores documentados', 'preservar proveedor y fecha', 'validar que el siguiente job no mezcle Guaki'],
    done: 'PASS solo con una búsqueda identificable y separada de Guaki.',
  },
  provider: {
    objective: 'Validar el proveedor de discovery asociado a Veyra en el runtime local.',
    checklist: ['comprobar health del proveedor autorizado', 'registrar fuente y resultado', 'mantener límites y no inventar capturas'],
    done: 'PASS solo con health y procedencia comprobables; servicio externo no disponible = BLOCKED.',
  },
  email: {
    objective: 'Completar la configuración segura del buzón profesional de Veyra en Mapache.',
    checklist: ['verificar cuenta y dominio sin mostrar credenciales', 'probar autenticación local sin envío', 'mantener can_send apagado'],
    done: 'PASS solo con autenticación real y preview; nunca enviar durante esta misión.',
  },
  template: {
    objective: 'Revisar y registrar la plantilla Veyra aprobada en el CRM local.',
    checklist: ['comparar con el branding vigente', 'validar HTML y texto plano', 'revisar variables y enlaces'],
    done: 'PASS solo si renderiza correctamente y queda identificada como aprobada o DRAFT.',
  },
  persistence: {
    objective: 'Definir una persistencia duradera y trazable para solicitudes Veyra.',
    checklist: ['auditar el sink actual', 'proponer la conexión mínima autorizada', 'documentar rollback y datos afectados'],
    done: 'PASS solo con evidencia de lectura/escritura; si depende de producción, marcar BLOCKED.',
  },
  seo: {
    objective: 'Completar la auditoría SEO/SEM de Veyra con evidencia local y accesos reales.',
    checklist: ['revisar títulos, descripciones, H1, schema, robots y sitemap', 'separar SEO de SEM', 'registrar analytics o Search Console solo si existe acceso'],
    done: 'PASS solo con cambios verificables; no crear campañas ni IDs ficticios.',
  },
  leads: {
    objective: 'Verificar la procedencia y calidad del conteo histórico de leads.',
    checklist: ['localizar fuentes reales', 'deduplicar sin borrar originales', 'clasificar contacto, cuarentena y fuente no verificada'],
    done: 'PASS solo con conteo respaldado por fuente; nunca convertir la meta en dato confirmado.',
  },
  backup: {
    objective: 'Completar la validación de backup, restore, propietario y base legal.',
    checklist: ['verificar hashes del snapshot', 'hacer restore de prueba en entorno aislado', 'registrar owner y base legal'],
    done: 'PASS solo con restore reproducible y trazabilidad completa.',
  },
};

export function buildCodexPrompt(item) {
  const blueprint = blueprints[item.key] ?? {
    objective: `Resolver la tarea operativa: ${item.title}.`,
    checklist: ['auditar el estado real', 'aplicar el cambio mínimo verificable', 'actualizar documentación y Centro de Comando'],
    done: 'PASS solo con evidencia reproducible; ausencia de evidencia = UNKNOWN o BLOCKED.',
  };
  return [
    'Eres Codex y recibes una misión del Centro de Comando de Veyra.',
    `Misión: ${item.title}`,
    `Proyecto: Veyra / Mapache · Responsable registrado: ${item.owner}`,
    `Estado observado: ${item.status}`,
    `Contexto actual: ${item.description}`,
    '',
    `Objetivo: ${blueprint.objective}`,
    'Plan mínimo:',
    ...blueprint.checklist.map((step, index) => `${index + 1}. ${step}.`),
    '',
    'Reglas obligatorias:',
    '- REAL DATA ONLY: no inventar resultados, leads, accesos ni configuraciones.',
    '- No revelar credenciales, claves ni datos personales en la salida.',
    '- No modificar Recovery, producción, Vercel, Supabase, DNS, Git remoto ni envíos sin evidencia y alcance explícito.',
    '- Guaki permanece WAITING y separado de Veyra.',
    '- Si una dependencia externa no está disponible, marcar BLOCKED; no simular.',
    '- Estados válidos: PASS / BLOCKED / UNKNOWN. Actualizar el Centro de Comando y la bitácora.',
    '',
    `Criterio de cierre: ${blueprint.done}`,
    'Entrega: resumen, archivos modificados, datos afectados, pruebas ejecutadas, riesgos y siguiente misión segura.',
  ].join('\n');
}
