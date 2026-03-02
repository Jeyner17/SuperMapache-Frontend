/**
 * Validar email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validar RUC Ecuador (13 dígitos)
 */
export const isValidRUC = (ruc) => {
  return /^\d{13}$/.test(ruc);
};

/**
 * Validar cédula Ecuador (10 dígitos)
 */
export const isValidCedula = (cedula) => {
  return /^\d{10}$/.test(cedula);
};

/**
 * Validar teléfono
 */
export const isValidPhone = (phone) => {
  return /^0\d{9}$/.test(phone);
};

/**
 * Validar contraseña (mínimo 6 caracteres)
 */
export const isValidPassword = (password) => {
  return password && password.length >= 6;
};

/**
 * Validar código de barras
 */
export const isValidBarcode = (barcode) => {
  return barcode && barcode.length >= 8;
};