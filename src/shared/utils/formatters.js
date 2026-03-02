/**
 * Formatear moneda
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * Formatear fecha DD/MM/YYYY
 */
export const formatDate = (date) => {
  if (!date) return '';
  return new Intl.DateTimeFormat('es-EC', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
};

/**
 * Formatear fecha y hora
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  return new Intl.DateTimeFormat('es-EC', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

/**
 * Formatear número con separadores de miles
 */
export const formatNumber = (number) => {
  return new Intl.NumberFormat('es-EC').format(number);
};

/**
 * Truncar texto
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};