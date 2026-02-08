
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Expediente, EtapaProceso, GravedadFalta, Hito } from '../types';

export type AppView = 'DASHBOARD' | 'AUDITORIA' | 'EXPEDIENTES' | 'GCC' | 'ARCHIVO' | 'CALENDARIO' | 'BITACORA' | 'EVIDENCIAS' | 'APOYO' | 'SALIDA' | 'REPORTE_PATIO';

interface ConvivenciaContextType {
  expedientes: Expediente[];
  setExpedientes: React.Dispatch<React.SetStateAction<Expediente[]>>;
  expedienteSeleccionado: Expediente | null;
  setExpedienteSeleccionado: (exp: Expediente | null) => void;
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  isWizardOpen: boolean;
  setIsWizardOpen: (open: boolean) => void;
  isAssistantOpen: boolean;
  setIsAssistantOpen: (open: boolean) => void;
  actualizarEtapa: (id: string, nuevaEtapa: EtapaProceso) => void;
  calcularPlazoLegal: (fecha: Date, gravedad: GravedadFalta) => Date;
}

const ConvivenciaContext = createContext<ConvivenciaContextType | undefined>(undefined);

const STORAGE_KEY = 'sge_expedientes_v1';

// Helper para días hábiles (Chile)
const addBusinessDays = (startDate: Date, days: number): Date => {
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

export const hitosBase = (esExpulsion: boolean): Hito[] => {
  const hitos: Hito[] = [
    { id: 'h1', titulo: 'Inicio de Proceso', descripcion: 'Registro de la denuncia y apertura de folio.', completado: true, fechaCumplimiento: new Date().toISOString().split('T')[0], requiereEvidencia: true },
    { id: 'h2', titulo: 'Notificación a Apoderados', descripcion: 'Comunicación oficial del inicio del proceso (Plazo 24h).', completado: false, requiereEvidencia: true },
    { id: 'h3', titulo: 'Periodo de Descargos', descripcion: 'Recepción de la versión del estudiante y su familia.', completado: false, requiereEvidencia: true },
    { id: 'h4', titulo: 'Investigación y Entrevistas', descripcion: 'Recopilación de pruebas y testimonios.', completado: false, requiereEvidencia: true },
  ];

  if (esExpulsion) {
    hitos.push({ 
      id: 'h-consejo', 
      titulo: 'Consulta Consejo Profesores', 
      descripcion: 'Hito obligatorio para medidas de expulsión según Ley Aula Segura.', 
      completado: false, 
      requiereEvidencia: true,
      esObligatorioExpulsion: true 
    });
  }

  hitos.push(
    { id: 'h5', titulo: 'Resolución del Director', descripcion: 'Determinación de la medida formativa o disciplinaria.', completado: false, requiereEvidencia: true },
    { id: 'h6', titulo: 'Plazo de Reconsideración', descripcion: 'Periodo para apelación ante la entidad sostenedora (15 días hábiles).', completado: false, requiereEvidencia: false }
  );

  return hitos;
};

const initialExpedientes: Expediente[] = [
  {
    id: 'EXP-2025-001',
    nnaNombre: 'A. Rojas B.',
    etapa: 'INVESTIGACION',
    gravedad: 'RELEVANTE',
    fechaInicio: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    plazoFatal: addBusinessDays(new Date(), 40).toISOString(),
    encargadoId: 'u1',
    esProcesoExpulsion: false,
    accionesPrevias: false,
    hitos: hitosBase(false)
  },
  {
    id: 'EXP-2025-002',
    nnaNombre: 'M. Soto L.',
    etapa: 'NOTIFICADO',
    gravedad: 'GRAVISIMA_EXPULSION',
    fechaInicio: new Date().toISOString(),
    plazoFatal: addBusinessDays(new Date(), 10).toISOString(),
    encargadoId: 'u1',
    esProcesoExpulsion: true,
    accionesPrevias: true,
    hitos: hitosBase(true)
  }
];

export const ConvivenciaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [expedienteSeleccionado, setExpedienteSeleccionado] = useState<Expediente | null>(null);
  const [currentView, setCurrentView] = useState<AppView>('DASHBOARD');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  const calcularPlazoLegal = useCallback((fecha: Date, gravedad: GravedadFalta): Date => {
    if (gravedad === 'LEVE') {
      return new Date(fecha.getTime() + 86400000); // 24h corridas
    }
    if (gravedad === 'GRAVISIMA_EXPULSION') {
      return addBusinessDays(fecha, 10); // 10 días hábiles (Aula Segura)
    }
    return addBusinessDays(fecha, 45); // Generalmente 2 meses, ajustado a 45 hábiles para seguridad
  }, []);

  const [expedientes, setExpedientes] = useState<Expediente[]>(() => {
    if (typeof window === 'undefined') return initialExpedientes;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as Expediente[];
    } catch {
      // ignore cache errors
    }
    return initialExpedientes;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expedientes));
    } catch {
      // ignore cache errors
    }
  }, [expedientes]);

  const actualizarEtapa = useCallback((id: string, nuevaEtapa: EtapaProceso) => {
    setExpedientes(prev => 
      prev.map(exp => exp.id === id ? { ...exp, etapa: nuevaEtapa } : exp)
    );
  }, []);

  return (
    <ConvivenciaContext.Provider value={{ 
      expedientes, 
      setExpedientes, 
      actualizarEtapa, 
      expedienteSeleccionado,
      setExpedienteSeleccionado,
      currentView,
      setCurrentView,
      isWizardOpen,
      setIsWizardOpen,
      isAssistantOpen,
      setIsAssistantOpen,
      calcularPlazoLegal
    }}>
      {children}
    </ConvivenciaContext.Provider>
  );
};

export const useConvivencia = () => {
  const context = useContext(ConvivenciaContext);
  if (!context) throw new Error('useConvivencia debe usarse dentro de ConvivenciaProvider');
  return context;
};
