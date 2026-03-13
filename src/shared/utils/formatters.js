/**
 * Formatear moneda
 */
export const formatCurrency = (value, simbolo = '$') => {
  if (value === null || value === undefined) return `${simbolo}0.00`;
  
  const numero = parseFloat(value);
  if (isNaN(numero)) return `${simbolo}0.00`;
  
  return `${simbolo}${numero.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

/**
 * Formatear fecha y hora
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const anio = d.getFullYear();
  
  const horas = String(d.getHours()).padStart(2, '0');
  const minutos = String(d.getMinutes()).padStart(2, '0');
  
  return `${dia}/${mes}/${anio} ${horas}:${minutos}`;
};

/**
 * Formatear solo fecha
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const anio = d.getFullYear();
  
  return `${dia}/${mes}/${anio}`;
};

/**
 * Formatear número
 */
export const formatNumber = (value, decimales = 2) => {
  if (value === null || value === undefined) return '0';
  
  const numero = parseFloat(value);
  if (isNaN(numero)) return '0';
  
  return numero.toFixed(decimales).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Formatear porcentaje
 */
export const formatPercentage = (value) => {
  if (value === null || value === undefined) return '0%';
  
  const numero = parseFloat(value);
  if (isNaN(numero)) return '0%';
  
  return `${numero.toFixed(2)}%`;
};

/**
 * Truncar texto
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};