import { GravedadFalta } from '@/types';

/**
 * Constantes de plazos legales según Circular 782
 * @see https://www.supereduc.cl/circulares/781-782/
 */
// Constants for legal deadlines (Circular 782)
export const BUSINESS_DAYS_EXPULSION = 10; // Aula Segura: 10 días hábiles
export const BUSINESS_DAYS_RELEVANTE = 45; // Faltas relevantes: ~2 meses
export const HOURS_LEVE = 24; // Faltas leves: 24 horas corridas
export const MILLISECONDS_PER_DAY = 86400000;

/**
 * Tipo para alertas de plazo
 */
export interface AlertaPlazo {
  expedienteId: string;
  diasRestantes: number;
  fechaLimite: string;
  gravedad: GravedadFalta;
}

/**
 * Calcular días restantes hasta el plazo fatal
 */
export const calcularDiasRestantes = (plazoFatal: string): number => {
  const hoy = new Date();
  const fatal = new Date(plazoFatal);
  const diferencia = fatal.getTime() - hoy.getTime();
  return Math.ceil(diferencia / MILLISECONDS_PER_DAY);
};

/**
 * Formatear fecha para display
 */
export const formatearFecha = (fechaIso: string): string => {
  const fecha = new Date(fechaIso);
  return fecha.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Formatear hora para display
 */
export const formatearHora = (fechaIso: string): string => {
  const fecha = new Date(fechaIso);
  return fecha.toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

/**
 * Verificar si el plazo está próximo a vencer (7 días o menos)
 */
export const esPlazoProximoVencer = (diasRestantes: number): boolean => {
  return diasRestantes >= 0 && diasRestantes <= 7;
};

/**
 * Verificar si el plazo está vencido
 */
export const estaVencido = (diasRestantes: number): boolean => {
  return diasRestantes < 0;
};

/**
 * Obtener estado del plazo para mostrar en UI
 */
export const getPlazoStatus = (plazoFatal: string): 'normal' | 'proximo' | 'urgente' | 'vencido' => {
  const dias = calcularDiasRestantes(plazoFatal);
  if (estaVencido(dias)) return 'vencido';
  if (dias <= 3) return 'urgente';
  if (esPlazoProximoVencer(dias)) return 'proximo';
  return 'normal';
};

/**
 * Agrega días hábiles a una fecha (excluye fines de semana)
 * @param startDate - Fecha inicial
 * @param days - Días hábiles a agregar
 * @returns Nueva fecha con días hábiles agregados
 */
export const addBusinessDays = (startDate: Date, days: number): Date => {
    let date = new Date(startDate.getTime());
    let count = 0;
    while (count < days) {
        date.setDate(date.getDate() + 1);
        if (date.getDay() !== 0 && date.getDay() !== 6) { // Excluye Sáb y Dom
            count++;
        }
    }
    return date;
};

/**
 * Calcula el plazo legal según la gravedad de la falta
 * Basado en Circular 782
 * 
 * @param fecha - Fecha de inicio del plazo
 * @param gravedad - Gravedad de la falta según normativa
 * @returns Fecha límite para resolver el expediente
 */
export const calcularPlazoLegal = (fecha: Date, gravedad: GravedadFalta): Date => {
    if (gravedad === 'LEVE') {
        return new Date(fecha.getTime() + HOURS_LEVE * 60 * 60 * 1000);
    }
    if (gravedad === 'GRAVISIMA_EXPULSION') {
        return addBusinessDays(fecha, BUSINESS_DAYS_EXPULSION);
    }
    return addBusinessDays(fecha, BUSINESS_DAYS_RELEVANTE);
};
