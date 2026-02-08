
import React, { useState, useMemo } from 'react';
import { useConvivencia, hitosBase } from '../context/ConvivenciaContext';
import { GravedadFalta, Expediente } from '../types';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  AlertTriangle, 
  ShieldCheck, 
  UserPlus,
  Scale,
  Calendar,
  Clock,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import NormativeBadge from './NormativeBadge';
import { useLocalDraft } from '../utils/useLocalDraft';

const ExpedienteWizard: React.FC = () => {
  const { setIsWizardOpen, setExpedientes, calcularPlazoLegal } = useConvivencia();
  const [step, setStep] = useState(1);
  
  const [formData, setFormData, clearFormData] = useLocalDraft('wizard:form', {
    nnaNombre: '',
    gravedad: 'LEVE' as GravedadFalta,
    advertenciaEscrita: false,
    planApoyoPrevio: false,
    descripcionHechos: '',
    fechaIncidente: new Date().toISOString().split('T')[0],
    horaIncidente: '10:00',
    lugarIncidente: 'Patio Central',
  });

  const isExpulsion = formData.gravedad === 'GRAVISIMA_EXPULSION';
  const hasIncompleteGraduality = isExpulsion && (!formData.advertenciaEscrita || !formData.planApoyoPrevio);

  const stepsConfig = [
    { id: 1, title: 'Clasificación', icon: UserPlus },
    { id: 2, title: 'Gradualidad', icon: Scale, hidden: !isExpulsion },
    { id: 3, title: 'Hechos', icon: Info },
    { id: 4, title: 'Plazos', icon: Clock },
    { id: 5, title: 'Confirmar', icon: CheckCircle2 },
  ].filter(s => !s.hidden);

  const activeStepConfig = stepsConfig.find(s => s.id === step) || stepsConfig[0];
  const activeIndex = stepsConfig.findIndex(s => s.id === step);

  const plazoCalculado = useMemo(() => {
    return calcularPlazoLegal(new Date(), formData.gravedad);
  }, [formData.gravedad, calcularPlazoLegal]);

  const handleNext = () => {
    const nextIdx = activeIndex + 1;
    if (nextIdx < stepsConfig.length) {
      setStep(stepsConfig[nextIdx].id);
    }
  };

  const handleBack = () => {
    const prevIdx = activeIndex - 1;
    if (prevIdx >= 0) {
      setStep(stepsConfig[prevIdx].id);
    }
  };

  const handleSubmit = () => {
    const nuevoExp: Expediente = {
      id: `EXP-2025-${Math.floor(Math.random() * 900) + 100}`,
      nnaNombre: formData.nnaNombre,
      etapa: 'INICIO',
      gravedad: formData.gravedad,
      fechaInicio: new Date().toISOString(),
      plazoFatal: plazoCalculado.toISOString(),
      encargadoId: 'u1',
      esProcesoExpulsion: isExpulsion,
      accionesPrevias: formData.advertenciaEscrita && formData.planApoyoPrevio,
      hitos: hitosBase(isExpulsion)
    };

    setExpedientes(prev => [nuevoExp, ...prev]);
    clearFormData();
    setIsWizardOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header con Progreso */}
        <div className="p-4 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/20">
              <activeStepConfig.icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Paso {activeIndex + 1}: {activeStepConfig.title}</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Apertura de Expediente Normativo</p>
            </div>
          </div>
          <button 
            onClick={() => setIsWizardOpen(false)}
            className="p-3 hover:bg-slate-200 rounded-full transition-colors text-slate-400 active:scale-95"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Barra de progreso visual */}
        <div className="px-4 md:px-12 py-4 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 z-0 rounded-full"></div>
            {stepsConfig.map((s, idx) => (
              <div 
                key={s.id} 
                className={`relative z-10 w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black transition-all duration-300 ${
                  step === s.id ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-lg' : 
                  idx < activeIndex ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 border-2 border-slate-200'
                }`}
              >
                {idx < activeIndex ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Cuerpo del Formulario */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10">
          
          {/* PASO 1: CLASIFICACIÓN */}
          {step === 1 && (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Sujeto del Proceso (Estudiante)</label>
                <select 
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 focus:outline-none text-sm font-bold transition-all appearance-none"
                  value={formData.nnaNombre}
                  onChange={e => setFormData({...formData, nnaNombre: e.target.value})}
                >
                  <option value="">Seleccione un estudiante...</option>
                  <option value="Juan Pérez M.">Juan Pérez M. (8° Básico)</option>
                  <option value="Sofia Castro L.">Sofia Castro L. (1° Medio)</option>
                  <option value="Andrés Silva R.">Andrés Silva R. (6° Básico)</option>
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Tipo de Falta (Gravedad RICE)</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(['LEVE', 'RELEVANTE', 'GRAVISIMA_EXPULSION'] as GravedadFalta[]).map((g) => (
                    <button
                      key={g}
                      onClick={() => setFormData({...formData, gravedad: g})}
                      className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center text-center space-y-3 ${
                        formData.gravedad === g 
                        ? 'border-blue-600 bg-blue-50/50 shadow-lg shadow-blue-500/5 scale-[1.02]' 
                        : 'border-slate-100 bg-white hover:border-slate-200'
                      }`}
                    >
                      <NormativeBadge gravedad={g} />
                      <span className={`text-[10px] font-bold uppercase tracking-tight ${formData.gravedad === g ? 'text-blue-700' : 'text-slate-400'}`}>
                        {g === 'GRAVISIMA_EXPULSION' ? 'Aula Segura' : g.toLowerCase()}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PASO 2: GRADUALIDAD (Solo Expulsión) */}
          {step === 2 && isExpulsion && (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
              <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-8 flex items-start space-x-6 relative overflow-hidden">
                <AlertCircle className="w-10 h-10 text-amber-600 shrink-0" />
                <div>
                  <h4 className="text-amber-900 font-black text-xs uppercase tracking-widest mb-2">Validación de Debido Proceso</h4>
                  <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                    Para iniciar una medida de expulsión (Circular 782), la entidad educativa debe demostrar que la sanción es proporcional y precedida de medidas formativas.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-center p-6 bg-white border-2 border-slate-100 rounded-2xl cursor-pointer hover:border-blue-200 transition-all group">
                  <input 
                    type="checkbox" 
                    className="w-6 h-6 text-blue-600 rounded-lg border-slate-300 focus:ring-blue-500 mr-4"
                    checked={formData.advertenciaEscrita}
                    onChange={e => setFormData({...formData, advertenciaEscrita: e.target.checked})}
                  />
                  <div>
                    <p className="text-xs font-black text-slate-800 uppercase tracking-tight">¿Existe Advertencia Escrita previa?</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1">Hito obligatorio de gradualidad</p>
                  </div>
                </label>

                <label className="flex items-center p-6 bg-white border-2 border-slate-100 rounded-2xl cursor-pointer hover:border-blue-200 transition-all group">
                  <input 
                    type="checkbox" 
                    className="w-6 h-6 text-blue-600 rounded-lg border-slate-300 focus:ring-blue-500 mr-4"
                    checked={formData.planApoyoPrevio}
                    onChange={e => setFormData({...formData, planApoyoPrevio: e.target.checked})}
                  />
                  <div>
                    <p className="text-xs font-black text-slate-800 uppercase tracking-tight">¿Se implementó Plan de Apoyo Psicosocial?</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1">Requerido para sustentar la medida ante la SIE</p>
                  </div>
                </label>
              </div>

              {hasIncompleteGraduality && (
                <div className="p-6 bg-red-50 border-2 border-red-200 rounded-2xl flex items-center space-x-4 border-dashed animate-pulse">
                  <AlertTriangle className="w-8 h-8 text-red-600 shrink-0" />
                  <div>
                    <h5 className="font-black text-red-700 text-[10px] uppercase tracking-widest mb-1">ALERTA DE VULNERABILIDAD LEGAL</h5>
                    <p className="text-[10px] text-red-600 font-bold leading-tight">Atención: Iniciar expulsión sin acciones previas puede invalidar el proceso ante la SIE por falta de gradualidad.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PASO 3: DESCRIPCIÓN DE HECHOS */}
          {step === 3 && (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Fecha</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500/10 focus:outline-none"
                    value={formData.fechaIncidente}
                    onChange={e => setFormData({...formData, fechaIncidente: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Hora</label>
                  <input 
                    type="time" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500/10 focus:outline-none"
                    value={formData.horaIncidente}
                    onChange={e => setFormData({...formData, horaIncidente: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Lugar del Incidente</label>
                <input 
                  type="text" 
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/5 focus:outline-none"
                  placeholder="Ej: Patio central, Sala 4° Medio..."
                  value={formData.lugarIncidente}
                  onChange={e => setFormData({...formData, lugarIncidente: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Narrativa de los Hechos (Objetiva)</label>
                <textarea 
                  className="w-full h-40 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-500/5 focus:outline-none resize-none"
                  placeholder="Describa el incidente de forma neutral, evitando juicios de valor prematuros..."
                  value={formData.descripcionHechos}
                  onChange={e => setFormData({...formData, descripcionHechos: e.target.value})}
                />
              </div>
            </div>
          )}

          {/* PASO 4: CÁLCULO DE PLAZOS */}
          {step === 4 && (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500 text-center">
              <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner mb-6">
                <Clock className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Cronograma Legal Estimado</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Basado en Circular 782 para faltas: {formData.gravedad}</p>

              <div className="bg-slate-50 rounded-[2rem] border border-slate-200 p-8 space-y-6 text-left">
                <div className="flex items-center justify-between border-b border-slate-200/50 pb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inicio Proceso</p>
                      <p className="text-xs font-bold text-slate-800 uppercase">{new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shadow-sm">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Vencimiento Fatal</p>
                      <p className="text-sm font-black text-red-600 uppercase">
                        {plazoCalculado.toLocaleDateString()} a las {plazoCalculado.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                  <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border border-red-100">
                    Plazo: {formData.gravedad === 'LEVE' ? '24h' : formData.gravedad === 'GRAVISIMA_EXPULSION' ? '10 días' : '2 meses'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* PASO 5: RESUMEN Y CONFIRMACIÓN */}
          {step === 5 && (
            <div className="space-y-8 animate-in zoom-in-95 duration-500">
              <div className="text-center space-y-2 mb-8">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Confirmar Registro</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Verifique la integridad de los datos normativos</p>
              </div>

              <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
                
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-white/10 pb-3">
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Estudiante</span>
                    <span className="text-sm font-black uppercase">{formData.nnaNombre}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-3">
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Gravedad</span>
                    <NormativeBadge gravedad={formData.gravedad} />
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-3">
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Lugar</span>
                    <span className="text-xs font-bold uppercase">{formData.lugarIncidente}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Cumplimiento Gradualidad</span>
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${!isExpulsion || (formData.advertenciaEscrita && formData.planApoyoPrevio) ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                      {!isExpulsion || (formData.advertenciaEscrita && formData.planApoyoPrevio) ? 'Validado' : 'Riesgo SIE'}
                    </span>
                  </div>
                </div>
              </div>
              
              <p className="text-[10px] text-slate-400 text-center italic font-medium leading-relaxed">
                "Al confirmar, el sistema generará el folio oficial y activará las alertas de plazo fatal para los encargados de convivencia."
              </p>
            </div>
          )}
        </div>

        {/* Footer Navegación */}
        <div className="p-4 md:p-8 border-t border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between gap-6">
          <button 
            onClick={activeIndex === 0 ? () => setIsWizardOpen(false) : handleBack}
            className="flex-1 py-4 rounded-2xl border border-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all active:scale-95 flex items-center justify-center space-x-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{activeIndex === 0 ? 'Anular' : 'Volver'}</span>
          </button>

          {activeIndex < stepsConfig.length - 1 ? (
            <button 
              onClick={handleNext}
              disabled={activeIndex === 0 && (!formData.nnaNombre || !formData.gravedad)}
              className={`flex-1 py-4 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-xl flex items-center justify-center space-x-2 active:scale-95 ${
                activeIndex === 0 && (!formData.nnaNombre || !formData.gravedad) ? 'bg-slate-300 cursor-not-allowed shadow-none' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
              }`}
            >
              <span>Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              className="flex-1 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-emerald-600/20 active:scale-95 flex items-center justify-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Finalizar Apertura</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpedienteWizard;
