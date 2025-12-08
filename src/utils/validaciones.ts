/**
 * Utilidades de validación para formularios
 */

/**
 * Valida el formato de un correo electrónico
 * @param email - El correo a validar
 * @returns true si el formato es válido, false en caso contrario
 */
export const validarCorreo = (email: string): boolean => {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // Regex estándar para validar correos
  // Valida que tenga:
  // - Caracteres antes del @
  // - El símbolo @
  // - Caracteres después del @ (dominio)
  // - Un punto (.)
  // - Caracteres después del punto (extensión)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(email.trim());
};

/**
 * Determina si un campo es de tipo correo electrónico basándose en su clave
 * @param fieldKey - La clave del campo
 * @returns true si el campo es de correo, false en caso contrario
 */
export const esCampoCorreo = (fieldKey: string): boolean => {
  if (!fieldKey || typeof fieldKey !== 'string') {
    return false;
  }

  const keyLower = fieldKey.toLowerCase();
  return keyLower.includes('correo') || keyLower.includes('email');
};

