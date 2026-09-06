export function evaluateMapacheActivation({ healthOk, summaryOk }) {
  if (!healthOk) {
    return { status: 'BLOCKED', message: 'Mapache local no responde en health.' };
  }
  if (!summaryOk) {
    return { status: 'BLOCKED', message: 'Mapache responde, pero el resumen CRM no esta disponible.' };
  }
  return { status: 'PASS', message: 'Mapache local responde y el resumen CRM esta disponible.' };
}
