
import React, { useMemo, useState } from 'react';
import { useConvivencia } from '../context/ConvivenciaContext';
import { 
  ArrowLeft, 
  Upload, 
  CheckCircle2, 
  FileText, 
  Users2, 
  AlertTriangle,
  Calendar,
  ShieldCheck,
  ChevronRight,
  FileSearch,
  MessageSquare,
  ImageIcon,
  History,
  Scale,
  Gavel,
  Check,
  ShieldAlert,
  Info
} from 'lucide-react';
import NormativeBadge from './NormativeBadge';
import PlazoCounter from './PlazoCounter';
import GeneradorResolucion from './GeneradorResolucion';
import { EtapaProceso } from '../types';
import { useLocalDraft } from '../utils/useLocalDraft';

const STEPS = [
  { key: 'INICIO', label: 'Inicio', icon: FileSearch },
  { key: 'NOTIFICADO', label: 'Notificación', icon: Calendar },
  { key: 'DESCARGOS', label: 'Descargos', icon: MessageSquare },
  { key: 'INVESTIGACION', label: 'Investigación', icon: ShieldAlert },
  { key: 'RESOLUCION_PENDIENTE', label: 'Resolución', icon: Gavel },
  { key: 'RECONSIDERACION', label: 'Apelación', icon: Scale },
];

const ExpedienteDetalle: React.FC = () => {
  const { expedienteSeleccionado, setExpedienteSeleccionado, actualizarEtapa } = useConvivencia();
  const draftKey = useMemo(() => `expediente:${expedienteSeleccionado?.id ?? 'none'}:descargos`, [expedienteSeleccionado?.id]);
  const fechaKey = useMemo(() => `expediente:${expedienteSeleccionado?.id ?? 'none'}:fecha_descargos`, [expedienteSeleccionado?.id]);
  const [descargos, setDescargos, clearDescargos] = useLocalDraft(draftKey, '');
  const [fechaDescargos, setFechaDescargos, clearFecha] = useLocalDraft(fechaKey, '');
  const [isGeneradorOpen, setIsGeneradorOpen] = useState(false);

  if (!expedienteSeleccionado) return null;

  const currentStepIndex = STEPS.findIndex(s => s.key === expedienteSeleccionado.etapa);
  const isExpulsion = expedienteSeleccionado.gravedad === 'GRAVISIMA_EXPULSION';
  const puedeFinalizar = !isExpulsion || expedienteSeleccionado.accionesPrevias;

  const evidencias = [
    { id: 1, name: 'Acta de Notificación.pdf', type: 'PDF', date: '2025-05-10', icon: FileText },
    { id: 2, name: 'Registro de Entrevista Estudiante.docx', type: 'DOCX', date: '2025-05-12', icon: MessageSquare },
    { id: 3, name: 'Prueba Fotográfica 01.jpg', type: 'IMG', date: '2025-05-11', icon: ImageIcon },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 animate-in fade-in slide-in-from-right-8 duration-500 pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4 md:gap-6">
            <button 
              onClick={() => setExpedienteSeleccionado(null)}
              className="p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:text-blue-600 border border-slate-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{expedienteSeleccionado.id}</h2>
                <NormativeBadge gravedad={expedienteSeleccionado.gravedad} />
              </div>
              <p className="text-slate-500 font-bold text-xs flex items-center uppercase tracking-widest">
                <Users2 className="w-4 h-4 mr-2 text-blue-500" />
                NNA: <span className="text-slate-900 ml-2">{expedienteSeleccionado.nnaNombre}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center flex-wrap gap-4">
            <PlazoCounter fechaLimite={expedienteSeleccionado.plazoFatal} />
            {isExpulsion && (
              <div className="bg-red-600 text-white px-4 py-2 rounded-xl text-[10px] font-black flex items-center shadow-lg border border-red-500 tracking-widest uppercase">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Ley Aula Segura
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-8">
        <section className="bg-white p-4 md:p-8 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/40">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-10 flex items-center">
            <History className="w-5 h-5 mr-3 text-blue-600" />
            Ruta Crítica de Cumplimiento (Circular 782)
          </h3>
          <div className="overflow-x-auto">
            <div className="relative flex justify-between items-start min-w-[720px]">
              <div className="absolute top-6 left-0 w-full h-1 bg-slate-100 -z-0"></div>
              {STEPS.map((step, idx) => {
                const isCompleted = idx < currentStepIndex || (idx === currentStepIndex && expedienteSeleccionado.etapa.startsWith('CERRADO'));
                const isCurrent = idx === currentStepIndex;
                return (
                  <div key={step.key} className="relative z-10 flex flex-col items-center group w-1/6 px-2">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-4 border-white shadow-lg ${
                      isCompleted ? 'bg-emerald-500 text-white' : 
                      isCurrent ? 'bg-blue-600 text-white scale-110' : 'bg-white text-slate-300 border-slate-100'
                    }`}>
                      {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <step.icon className="w-5 h-5" />}
                    </div>
                    <div className="mt-4 text-center">
                      <p className={`text-[9px] font-black uppercase tracking-tighter ${
                        isCompleted ? 'text-emerald-600' : isCurrent ? 'text-blue-700' : 'text-slate-400'
                      }`}>
                        {step.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {isExpulsion && (
              <div className={`border-2 rounded-3xl p-8 relative overflow-hidden transition-all ${expedienteSeleccionado.accionesPrevias ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200 shadow-red-100 shadow-xl animate-pulse'}`}>
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <ShieldCheck className="w-24 h-24" />
                </div>
                <h3 className={`font-black text-sm uppercase tracking-widest flex items-center mb-6 ${expedienteSeleccionado.accionesPrevias ? 'text-emerald-900' : 'text-red-900'}`}>
                  {expedienteSeleccionado.accionesPrevias ? <CheckCircle2 className="w-5 h-5 mr-3" /> : <AlertTriangle className="w-5 h-5 mr-3" />}
                  Validación de Gradualidad (Art. 6 Circular 782)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`flex items-center p-4 rounded-2xl border-2 ${expedienteSeleccionado.accionesPrevias ? 'bg-emerald-100 border-emerald-200 text-emerald-700' : 'bg-white border-red-200 text-red-700'}`}>
                    <Check className="w-4 h-4 mr-3" />
                    <div>
                      <p className="text-[10px] font-black uppercase">Advertencia Escrita</p>
                    </div>
                  </div>
                  <div className={`flex items-center p-4 rounded-2xl border-2 ${expedienteSeleccionado.accionesPrevias ? 'bg-emerald-100 border-emerald-200 text-emerald-700' : 'bg-white border-red-200 text-red-700'}`}>
                    <Check className="w-4 h-4 mr-3" />
                    <div>
                      <p className="text-[10px] font-black uppercase">Apoyo Psicosocial</p>
                    </div>
                  </div>
                </div>
                {!expedienteSeleccionado.accionesPrevias && (
                  <div className="mt-6 p-4 bg-white rounded-xl border border-red-200">
                    <p className="text-[10px] text-red-600 font-bold flex items-center italic">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      BLOQUEO LEGAL: No se puede proceder con la resolución de expulsión sin acreditar estas medidas previas.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl p-4 md:p-8">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center">
                <MessageSquare className="w-5 h-5 mr-3 text-blue-600" />
                Registro de Descargos (Acta de Escucha)
              </h3>
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Fecha de Descargos</label>
                  <input
                    type="date"
                    value={fechaDescargos}
                    onChange={(e) => setFechaDescargos(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                  />
                </div>
                <button
                  onClick={() => { clearDescargos(); clearFecha(); }}
                  className="self-end md:self-start px-4 py-3 bg-white border border-slate-200 text-slate-500 rounded-2xl text-[10px] font-black uppercase hover:bg-slate-50 transition-all"
                >
                  Limpiar borrador
                </button>
              </div>
              <textarea 
                className="w-full h-40 bg-slate-50 border border-slate-200 rounded-3xl p-6 text-sm font-medium focus:ring-4 focus:ring-blue-500/5 focus:outline-none placeholder:text-slate-300"
                placeholder="Escriba aquí el resumen de la versión del estudiante..."
                value={descargos}
                onChange={(e) => setDescargos(e.target.value)}
              />
            </div>

            <div className="flex flex-col md:flex-row gap-4 pt-4">
              <button 
                onClick={() => setIsGeneradorOpen(true)}
                disabled={!puedeFinalizar}
                className={`flex-1 flex items-center justify-center space-x-3 py-5 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.15em] transition-all shadow-xl ${
                  puedeFinalizar 
                    ? 'bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-700' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Gavel className="w-5 h-5" />
                <span>Emitir Resolución Final</span>
              </button>
              
              <button 
                onClick={() => actualizarEtapa(expedienteSeleccionado.id, 'CERRADO_GCC')}
                className="flex-1 flex items-center justify-center space-x-3 py-5 rounded-[1.5rem] bg-emerald-600 text-white text-xs font-black uppercase tracking-[0.15em] hover:bg-emerald-700 shadow-xl shadow-emerald-600/20"
              >
                <Handshake className="w-5 h-5" />
                <span>Derivar a Mediación GCC</span>
              </button>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl p-8 flex flex-col h-full">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center">
                <FileText className="w-5 h-5 mr-3 text-blue-600" />
                Evidencia Indexada
              </h3>
              <div className="space-y-3 flex-1">
                {evidencias.map((doc) => (
                  <div key={doc.id} className="flex items-center p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-blue-50 transition-all cursor-pointer">
                    <doc.icon className="w-5 h-5 text-blue-600 mr-4" />
                    <div className="flex-1 overflow-hidden">
                      <p className="text-[11px] font-black text-slate-700 truncate uppercase">{doc.name}</p>
                      <p className="text-[9px] font-bold text-slate-400 italic">{doc.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {isGeneradorOpen && <GeneradorResolucion onClose={() => setIsGeneradorOpen(false)} />}
    </div>
  );
};

const Handshake: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m11 17 2 2 6-6"/><path d="m18 10 1-1a2 2 0 0 0-3-3l-1 1"/><path d="m14 14 1 1a2 2 0 0 0 3 0l.5-.5"/><path d="m8 5.8a2.1 2.1 0 0 1 2.1-2.1c1.1 0 2 1 2 2.1a2.1 2.1 0 0 1-2.1 2.1c-1.1 0-2-1-2-2.1Z"/><path d="M10.5 9.9a4.8 4.8 0 0 0-6.3 1.8A5.2 5.2 0 0 0 5.6 18l.8.7"/><path d="M7 15h2"/><path d="m15 18-2 2"/></svg>
);

export default ExpedienteDetalle;
