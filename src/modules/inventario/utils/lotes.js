// Utilidades de lotes. Las fechas de caducidad se manejan como día calendario
// ('YYYY-MM-DD'): convertirlas con new Date() las corría un día en UTC-5.

const pad = (n) => String(n).padStart(2, '0');

/** Fecha local de hoy en formato 'YYYY-MM-DD' (no usar toISOString: es UTC). */
export const hoyISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/** Extrae 'YYYY-MM-DD' de un string/Date de la API. */
export const soloFecha = (fecha) => {
  if (!fecha) return null;
  return String(fecha instanceof Date ? fecha.toISOString() : fecha).split('T')[0];
};

/** Días calendario desde hoy hasta la fecha (negativo si ya pasó). */
export const diasHasta = (fecha) => {
  const f = soloFecha(fecha);
  if (!f) return null;
  const [a, m, d] = f.split('-').map(Number);
  const [ha, hm, hd] = hoyISO().split('-').map(Number);
  return Math.round((Date.UTC(a, m - 1, d) - Date.UTC(ha, hm - 1, hd)) / 86400000);
};

/**
 * Estado a mostrar: el backend actualiza vencidos una vez al día (cron), así que
 * si la fecha ya pasó se muestra como vencido aunque el cron no haya corrido.
 * El día de caducidad todavía es utilizable.
 */
export const estadoEfectivoLote = (lote) => {
  if (!lote?.fecha_caducidad || lote.estado === 'agotado') return lote?.estado;
  const dias = diasHasta(lote.fecha_caducidad);
  if (dias !== null && dias < 0) return 'vencido';
  return lote.estado;
};

const num = (v) => (v === null || v === undefined || v === '' ? v : Number(v));

const normalizarMovimiento = (m) => ({
  ...m,
  tipo_movimiento: m.tipo_movimiento ?? m.tipoMovimiento,
  cantidad: num(m.cantidad),
  cantidad_anterior: num(m.cantidad_anterior ?? m.cantidadAnterior),
  cantidad_nueva: num(m.cantidad_nueva ?? m.cantidadNueva),
  created_at: m.created_at ?? m.createdAt,
});

/**
 * La API devuelve los lotes en camelCase (entidad) y las alertas en snake_case;
 * la UI usa snake_case. Antes la vista de lotes mostraba campos vacíos.
 */
export const normalizarLote = (l) => {
  if (!l) return l;
  return {
    ...l,
    numero_lote: l.numero_lote ?? l.numeroLote,
    cantidad_actual: num(l.cantidad_actual ?? l.cantidadActual),
    cantidad_inicial: num(l.cantidad_inicial ?? l.cantidadInicial),
    fecha_ingreso: l.fecha_ingreso ?? l.fechaIngreso,
    fecha_caducidad: l.fecha_caducidad ?? l.fechaCaducidad ?? null,
    producto: l.producto
      ? { ...l.producto, unidad_medida: l.producto.unidad_medida ?? l.producto.unidadMedida }
      : null,
    movimientos: Array.isArray(l.movimientos) ? l.movimientos.map(normalizarMovimiento) : l.movimientos,
  };
};
