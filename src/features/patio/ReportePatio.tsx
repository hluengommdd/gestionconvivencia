
import React, { useState, useMemo } from 'react';
import { AlertCircle, MapPin, Send, ShieldAlert, CheckCircle, Calendar, ChevronDown } from 'lucide-react';
import { useLocalDraft } from '@/shared/utils/useLocalDraft';
import { useConvivencia } from '@/shared/context/ConvivenciaContext';
import { supabase } from '@/shared/lib/supabaseClient';
import { EstudianteAutocomplete } from './EstudianteAutocomplete';

type GravedadType = 'LEVE' | 'RELEVANTE' | 'GRAVE';

interface FormDataPatio {
  informante: string;
  estudianteId: string | null;
  estudianteNombre: string;
  estudianteCurso: string;
  lugar: string;
  descripcion: string;
  gravedadPercibida: GravedadType;
  fechaIncidente: string;
}

const ReportePatio: React.FC = () => {
  const { estudiantes } = useConvivencia();
  const [enviado, setEnviado] = useState(false);
  const [selectedCurso, setSelectedCurso] = useState<string>('');
  
  const [formData, setFormData, clearFormData] = useLocalDraft<FormDataPatio>('reporte:patio', {
    informante: '',
    estudianteId: null,
    estudianteNombre: '',
    estudianteCurso: '',
    lugar: '',
    descripcion: '',
    gravedadPercibida: 'LEVE',
    fechaIncidente: ''
  });

  // Obtener cursos únicos ordenados
  const cursos = useMemo(() => {
    const cursosSet = new Set<string>();
    estudiantes.forEach(est => {
      if (est.curso) {
        cursosSet.add(est.curso);
      }
    });
    return Array.from(cursosSet).sort();
  }, [estudiantes]);

  const handleEstudianteChange = (estudianteId: string | null, nombre: string, curso: string) => {
    setFormData(prev => ({
      ...prev,
      estudianteId,
      estudianteNombre: nombre,
      estudianteCurso: curso
    }));
    // Si ya hay un curso seleccionado, mantenerlo
    if (!selectedCurso && curso) {
      setSelectedCurso(curso);
    }
  };

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (supabase) {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;

      if (userId) {
        const { data: profile } = await supabase
          .from('perfiles')
          .select('establecimiento_id')
          .eq('id', userId)
          .maybeSingle();

        // Determinar fecha_incidente
        const fechaIncidente = formData.fechaIncidente 
          ? new Date(formData.fechaIncidente).toISOString() 
          : new Date().toISOString();

        await supabase
          .from('reportes_patio')
          .insert({
            establecimiento_id: profile?.establecimiento_id ?? null,
            informante: formData.informante,
            estudiante_id: formData.estudianteId,
            estudiante_nombre: formData.estudianteNombre || null,
            lugar: formData.lugar || null,
            descripcion: formData.descripcion,
            gravedad_percibida: formData.gravedadPercibida,
            fecha_incidente: fechaIncidente,
            curso: formData.estudianteCurso || selectedCurso || null
          });
      } else {
        console.warn('Supabase: no hay sesion activa, se usara fallback local');
      }
    }
    setEnviado(true);
    setTimeout(() => setEnviado(false), 3000);
    clearFormData();
    setSelectedCurso('');
  };

  return (
    <main className="flex-1 p-4 md:p-10 bg-slate-50 flex justify-center items-center overflow-y-auto animate-in fade-in duration-700">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] border border-slate-200 shadow-2xl p-6 md:p-12 space-y-8">
        <header className="text-center space-y-2">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-amber-100 text-amber-600 rounded-[2rem] flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 md:w-10 md:h-10" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight uppercase">Reporte de Incidente en Patio</h2>
          <p className="text-slate-400 font-bold text-[9px] md:text-[10px] uppercase tracking-[0.2em]">Entrada Rápida - Vigilancia y Convivencia</p>
        </header>

        {enviado ? (
          <div className="py-12 text-center space-y-4 animate-in zoom-in-95">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto" />
            <h3 className="text-xl font-black text-slate-900">REPORTE ENVIADO</h3>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">El encargado de convivencia ha sido notificado para la apertura de folio.</p>
          </div>
        ) : (
          <form onSubmit={handleEnviar} className="space-y-6">
            {/* Primera fila: Informante y Curso */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Informante (Nombre/Cargo)
                </label>
                <input 
                  required
                  type="text" 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-amber-500/5 focus:outline-none"
                  value={formData.informante}
                  onChange={e => setFormData({...formData, informante: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Curso del Estudiante
                </label>
                <div className="relative">
                  <select
                    value={selectedCurso}
                    onChange={(e) => {
                      setSelectedCurso(e.target.value);
                      // Limpiar selección de estudiante al cambiar curso
                      handleEstudianteChange(null, '', '');
                    }}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="">Seleccione curso...</option>
                    {cursos.map((curso) => (
                      <option key={curso} value={curso}>
                        {curso}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Segunda fila: Estudiante (dependiente del curso) */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Estudiante(s) Involucrado(s)
              </label>
              <EstudianteAutocomplete
                value={formData.estudianteNombre}
                onChange={handleEstudianteChange}
                placeholder={selectedCurso ? "Buscar en " + selectedCurso + "..." : "Primero seleccione un curso..."}
                showBadge={true}
                cursoFiltro={selectedCurso || null}
                disabled={!selectedCurso}
              />
            </div>

            {/* Tercera fila: Lugar y Fecha */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                  <MapPin className="w-3 h-3 mr-2" /> Lugar del Evento
                </label>
                <select 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none"
                  value={formData.lugar}
                  onChange={e => setFormData({...formData, lugar: e.target.value})}
                >
                  <option value="">Seleccione lugar...</option>
                  <option value="PATIO">Patio Central</option>
                  <option value="SALA">Sala de Clases</option>
                  <option value="BANO">Baños</option>
                  <option value="COMEDOR">Casino/Comedor</option>
                  <option value="OTRO">Otro</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                  <Calendar className="w-3 h-3 mr-2" /> Fecha y Hora del Incidente
                </label>
                <input 
                  type="datetime-local" 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none"
                  value={formData.fechaIncidente}
                  onChange={e => setFormData({...formData, fechaIncidente: e.target.value})}
                />
              </div>
            </div>

            {/* Cuarta fila: Gravedad */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                <ShieldAlert className="w-3 h-3 mr-2" /> Gravedad Observada
              </label>
              <div className="flex gap-4">
                {(['LEVE', 'RELEVANTE', 'GRAVE'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setFormData({...formData, gravedadPercibida: g})}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                      formData.gravedadPercibida === g ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-slate-400 border-slate-100'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Quinta fila: Descripción */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Narración de los Hechos
              </label>
              <textarea 
                required
                className="w-full h-32 px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none resize-none"
                placeholder="Describa brevemente lo sucedido..."
                value={formData.descripcion}
                onChange={e => setFormData({...formData, descripcion: e.target.value})}
              />
            </div>

            {/* Botón de envío */}
            <button 
              type="submit"
              className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-slate-800 transition-all flex items-center justify-center space-x-3 active:scale-95"
            >
              <Send className="w-5 h-5" />
              <span>Enviar a Convivencia</span>
            </button>
          </form>
        )}
      </div>
    </main>
  );
};

export default ReportePatio;
