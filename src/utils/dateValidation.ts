// Utilidades para validación de fechas en formato DD/MM/YYYY o DD/MM/YYYY HH:MM:SS

/**
 * Valida que una fecha tenga el formato DD/MM/YYYY o DD/MM/YYYY HH:MM:SS
 */
export const isValidDateFormat = (dateString: string): boolean => {
  const dateOnlyRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const dateTimeRegex = /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/;
  return dateOnlyRegex.test(dateString) || dateTimeRegex.test(dateString);
};

/**
 * Verifica si una fecha incluye hora
 */
export const hasTime = (dateString: string): boolean => {
  return /^\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2}$/.test(dateString);
};

/**
 * Valida que una fecha sea válida (días y meses correctos)
 * Soporta formato DD/MM/YYYY o DD/MM/YYYY HH:MM:SS
 */
export const isValidDate = (dateString: string): boolean => {
  if (!isValidDateFormat(dateString)) {
    return false;
  }

  // Extraer fecha y hora si existe
  const dateTimeParts = dateString.split(' ');
  const datePart = dateTimeParts[0];
  const timePart = dateTimeParts[1];

  // Validar formato de hora si existe
  if (timePart) {
    const timeRegex = /^(\d{2}):(\d{2}):(\d{2})$/;
    if (!timeRegex.test(timePart)) {
      return false;
    }
    const [hours, minutes, seconds] = timePart.split(':').map(Number);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59) {
      return false;
    }
  }

  const [day, month, year] = datePart.split('/').map(Number);

  // Validar rango de mes
  if (month < 1 || month > 12) {
    return false;
  }

  // Validar rango de día
  if (day < 1 || day > 31) {
    return false;
  }

  // Validar días según el mes
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  // Año bisiesto
  if (month === 2 && isLeapYear(year)) {
    if (day > 29) {
      return false;
    }
  } else {
    if (day > daysInMonth[month - 1]) {
      return false;
    }
  }

  // Validar año (ej: no permitir años negativos o muy lejanos)
  if (year < 1900 || year > 2100) {
    return false;
  }

  // Crear objeto Date para validación adicional
  // Nota: Date usa formato MM/DD/YYYY, así que ajustamos
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

/**
 * Verifica si un año es bisiesto
 */
const isLeapYear = (year: number): boolean => {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
};

/**
 * Valida que una fecha sea futura (después de ahora)
 * Si incluye hora, compara con hora actual, si no, compara solo fechas
 */
export const isFutureDate = (dateString: string): boolean => {
  if (!isValidDate(dateString)) {
    return false;
  }

  const dateTimeParts = dateString.split(' ');
  const datePart = dateTimeParts[0];
  const timePart = dateTimeParts[1];

  const [day, month, year] = datePart.split('/').map(Number);
  const date = new Date(year, month - 1, day);

  // Si tiene hora, establecerla
  if (timePart) {
    const [hours, minutes, seconds] = timePart.split(':').map(Number);
    date.setHours(hours, minutes, seconds, 0);
  } else {
    // Si no tiene hora, usar fin del día (23:59:59)
    date.setHours(23, 59, 59, 0);
  }

  const now = new Date();

  return date > now;
};

/**
 * Convierte una fecha DD/MM/YYYY o DD/MM/YYYY HH:MM:SS a objeto Date
 */
export const parseDate = (dateString: string): Date | null => {
  if (!isValidDate(dateString)) {
    return null;
  }

  const dateTimeParts = dateString.split(' ');
  const datePart = dateTimeParts[0];
  const timePart = dateTimeParts[1];

  const [day, month, year] = datePart.split('/').map(Number);
  const date = new Date(year, month - 1, day);

  // Si tiene hora, establecerla
  if (timePart) {
    const [hours, minutes, seconds] = timePart.split(':').map(Number);
    date.setHours(hours, minutes, seconds, 0);
  }

  return date;
};

/**
 * Calcula los días restantes hasta una fecha (considerando hora si está presente)
 */
export const getDaysRemaining = (dateString: string): number | null => {
  if (!isValidDate(dateString)) {
    return null;
  }

  const date = parseDate(dateString);
  if (!date) {
    return null;
  }

  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

/**
 * Calcula horas y minutos restantes además de días
 */
export const getTimeRemaining = (dateString: string): { days: number; hours: number; minutes: number } | null => {
  if (!isValidDate(dateString)) {
    return null;
  }

  const date = parseDate(dateString);
  if (!date) {
    return null;
  }

  const now = new Date();
  const diffTime = date.getTime() - now.getTime();

  if (diffTime < 0) {
    return null;
  }

  const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes };
};

/**
 * Formatea una fecha para mostrar (DD/MM/YYYY o DD/MM/YYYY HH:MM:SS)
 */
export const formatDate = (date: Date | string, includeTime: boolean = false): string => {
  if (typeof date === 'string') {
    return date;
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const dateStr = `${day}/${month}/${year}`;

  if (includeTime) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${dateStr} ${hours}:${minutes}:${seconds}`;
  }

  return dateStr;
};

/**
 * Convierte un input datetime-local a formato DD/MM/YYYY HH:MM:SS
 */
export const formatDateTimeLocalToCustom = (dateTimeLocal: string): string => {
  if (!dateTimeLocal) return '';

  // dateTimeLocal viene en formato YYYY-MM-DDTHH:MM
  const [datePart, timePart] = dateTimeLocal.split('T');
  if (!datePart || !timePart) return '';

  const [year, month, day] = datePart.split('-');
  const [hours, minutes] = timePart.split(':');

  // Formato: DD/MM/YYYY HH:MM:SS (usar 59 para segundos por defecto, o 00 si no se especifica)
  // Si el usuario quiere una hora específica, debería usar 23:59:59 para el fin del día
  return `${day}/${month}/${year} ${hours}:${minutes}:59`;
};

/**
 * Convierte formato DD/MM/YYYY HH:MM:SS a datetime-local (YYYY-MM-DDTHH:MM)
 */
export const formatCustomToDateTimeLocal = (customFormat: string): string => {
  if (!customFormat) return '';

  const dateTimeParts = customFormat.split(' ');
  if (dateTimeParts.length === 1) {
    // Solo fecha DD/MM/YYYY
    const [day, month, year] = dateTimeParts[0].split('/');
    return `${year}-${month}-${day}T00:00`;
  }

  const [day, month, year] = dateTimeParts[0].split('/');
  const timeParts = dateTimeParts[1].split(':');
  const [hours, minutes] = timeParts;
  // Si hay segundos, ignorarlos porque datetime-local solo acepta HH:MM

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

