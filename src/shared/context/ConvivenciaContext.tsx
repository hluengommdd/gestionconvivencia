
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import { Estudiante, Expediente, EtapaProceso, GravedadFalta, Hito } from '@/types';
import { calcularPlazoLegal, addBusinessDays } from '@/shared/utils/plazos';
import { supabase, safeSupabase } from '@/shared/lib/supabaseClient';
import { 
  DbEstudiante, 
  ExpedienteQueryRow,
  mapDbTipoFaltaToGravedad,
  mapDbEstadoToEtapa
} from '@/shared/types/supabase';

// AppView removed as it's replaced by Routing

interface ConvivenciaContextType {
  expedientes: Expediente[];
  setExpedientes: React.Dispatch<React.SetStateAction<Expediente[]>>;
  estudiantes: Estudiante[];
  setEstudiantes: React.Dispatch<React.SetStateAction<Estudiante[]>>;
  expedienteSeleccionado: Expediente | null;
  setExpedienteSeleccionado: (exp: Expediente | null) => void;

  isWizardOpen: boolean;
  setIsWizardOpen: (open: boolean) => void;
  isAssistantOpen: boolean;
  setIsAssistantOpen: (open: boolean) => void;
  actualizarEtapa: (id: string, nuevaEtapa: EtapaProceso) => void;
  calcularPlazoLegal: (fecha: Date, gravedad: GravedadFalta) => Date;
}

const ConvivenciaContext = createContext<ConvivenciaContextType | undefined>(undefined);

const STORAGE_KEY = 'sge_expedientes_v1';

// Helper para días hábiles moved to utils/plazos.ts

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
    nnaCurso: '7° Básico A',
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
    nnaCurso: '8° Básico B',
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

/**
 * Carga datos de localStorage de forma segura
 */
const loadLocalExpedientes = (): Expediente[] => {
  if (typeof window === 'undefined') return initialExpedientes;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Validar que sea un array
      if (Array.isArray(parsed)) {
        return parsed as Expediente[];
      }
    }
  } catch (error) {
    console.warn('Error loading expedientes from localStorage:', error);
  }
  return initialExpedientes;
};

export const ConvivenciaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [expedienteSeleccionado, setExpedienteSeleccionado] = useState<Expediente | null>(null);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [supabaseLoaded, setSupabaseLoaded] = useState(false);
  const dataLoadedRef = useRef(false);

  const calcularPlazo = useCallback((fecha: Date, gravedad: GravedadFalta): Date => {
    return calcularPlazoLegal(fecha, gravedad);
  }, []);

  const [expedientes, setExpedientes] = useState<Expediente[]>(loadLocalExpedientes);

  useEffect(() => {
    const supabaseClient = supabase;
    if (!supabaseClient) return;
    if (dataLoadedRef.current) return; // Evitar carga duplicada

    const loadExpedientes = async () => {
      const { data, error } = await supabaseClient
        .from('expedientes')
        .select('id, folio, tipo_falta, estado_legal, etapa_proceso, fecha_inicio, plazo_fatal, creado_por, estudiantes(id, nombre_completo, curso)')
        .limit(200);

      if (error || !data) {
        console.error('Supabase: no se pudieron cargar expedientes', error);
        return;
      }

      const mapped: Expediente[] = data.map((row: ExpedienteQueryRow) => {
        const gravedad = mapDbTipoFaltaToGravedad(row.tipo_falta);
        const esExpulsion = gravedad === 'GRAVISIMA_EXPULSION';
        const fechaInicio = row.fecha_inicio ? new Date(row.fecha_inicio).toISOString() : new Date().toISOString();
        const plazoFatal = row.plazo_fatal
          ? new Date(row.plazo_fatal).toISOString()
          : addBusinessDays(new Date(), esExpulsion ? 10 : 40).toISOString();

        const etapaDb = row.etapa_proceso ?? row.estado_legal;
        const estudianteData = Array.isArray(row.estudiantes) ? row.estudiantes[0] : row.estudiantes;

        return {
          id: row.folio ?? row.id,
          dbId: row.id,
          nnaNombre: estudianteData?.nombre_completo ?? 'Sin nombre',
          nnaCurso: estudianteData?.curso ?? null,
          etapa: mapDbEstadoToEtapa(etapaDb),
          gravedad,
          fechaInicio,
          plazoFatal,
          encargadoId: row.creado_por ?? '',
          esProcesoExpulsion: esExpulsion,
          accionesPrevias: false,
          hitos: hitosBase(esExpulsion)
        };
      });

      if (mapped.length > 0) {
        dataLoadedRef.current = true;
        setSupabaseLoaded(true);
        setExpedientes(mapped);
      }
    };

    const loadEstudiantes = async () => {
      const { data, error } = await supabaseClient
        .from('estudiantes')
        .select('id, nombre_completo, curso')
        .limit(200);

      if (error || !data) {
        console.error('Supabase: no se pudieron cargar estudiantes', error);
        return;
      }

      setEstudiantes(
        data.map((row: DbEstudiante) => ({
          id: row.id,
          nombreCompleto: row.nombre_completo,
          curso: row.curso ?? null
        }))
      );
    };

    loadExpedientes();
    loadEstudiantes();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expedientes));
    } catch (error) {
      console.warn('Error saving expedientes to localStorage:', error);
    }
  }, [expedientes, supabaseLoaded]);

  const actualizarEtapa = useCallback((id: string, nuevaEtapa: EtapaProceso) => {
    setExpedientes(prev => {
      const updated = prev.map(exp => 
        exp.id === id ? { ...exp, etapa: nuevaEtapa } : exp
      );
      
      // Buscar en el estado actualizado
      const target = updated.find(e => e.id === id);
      if (supabase && target?.dbId) {
        safeSupabase()
          .from('expedientes')
          .update({ etapa_proceso: nuevaEtapa })
          .eq('id', target.dbId)
          .then(({ error }) => {
            if (error) {
              console.warn('Supabase: no se pudo actualizar etapa', error);
              // Revertir cambio en caso de error
              setExpedientes(prev);
            }
          });
      }
      
      return updated;
    });
  }, []);

  return (
    <ConvivenciaContext.Provider value={{
      expedientes,
      setExpedientes,
      estudiantes,
      setEstudiantes,
      actualizarEtapa,
      expedienteSeleccionado,
      setExpedienteSeleccionado,

      isWizardOpen,
      setIsWizardOpen,
      isAssistantOpen,
      setIsAssistantOpen,
      calcularPlazoLegal: calcularPlazo
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
