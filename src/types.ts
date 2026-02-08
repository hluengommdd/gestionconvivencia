
export type EtapaProceso = 
  | 'INICIO' 
  | 'NOTIFICADO' 
  | 'DESCARGOS' 
  | 'INVESTIGACION' 
  | 'RESOLUCION_PENDIENTE' 
  | 'RECONSIDERACION' 
  | 'CERRADO_SANCION' 
  | 'CERRADO_GCC'; 

export type GravedadFalta = 'LEVE' | 'RELEVANTE' | 'GRAVISIMA_EXPULSION';

export interface Hito {
  id: string;
  titulo: string;
  descripcion: string;
  fechaCumplimiento?: string;
  completado: boolean;
  requiereEvidencia: boolean;
  evidenciaUrl?: string;
  esObligatorioExpulsion?: boolean;
}

export interface Expediente {
  id: string;
  nnaNombre: string;
  etapa: EtapaProceso;
  gravedad: GravedadFalta;
  fechaInicio: string;
  plazoFatal: string;
  encargadoId: string;
  esProcesoExpulsion?: boolean;
  accionesPrevias: boolean; 
  hitos: Hito[];
}

export interface User {
  id: string;
  nombre: string;
  rol: 'DIRECTOR' | 'ENCARGADO_CONVIVENCIA' | 'PSICOLOGO' | 'ADMIN';
}
