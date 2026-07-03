/**
 * AutoYa — Utilidad de Moneda
 * REGLA CERO: Todo precio en la plataforma pasa por aquí.
 * Los precios en DB son INTEGER (precio_ars) — sin decimales, sin float.
 */
export const formatARS = (amount: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Formatea un número como precio en ARS compacto (para badges y tags)
 * Ej: 35000000 → "$35 M"
 */
export const formatARSCompact = (amount: number): string => {
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1).replace('.', ',')} M`;
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(0)} mil`;
  }
  return formatARS(amount);
};
