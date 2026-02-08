
import React, { useState } from 'react';
import { useConvivencia } from '../context/ConvivenciaContext';
import { 
  Handshake, 
  CheckCircle, 
  Clock, 
  Plus, 
  Trash2, 
  Users, 
  FileText, 
  Printer, 
  Info,
  Calendar,
  AlertCircle,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface Compromiso {
  id: string;
  descripcion: string;
  fechaCumplimiento: string;
  responsable: string;
  completado: boolean;
}

const CentroMediacionGCC: React.FC = () => {
  const { expedientes, setExpedientes, setExpedienteSeleccionado } = useConvivencia();
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  
  // Estados para el formulario de mediación
  const [facilitador, setFacilitador] = useState('Ana María - Psicóloga');
  const [compromisos, setCompromisos] = useState<Compromiso[]>([]);
  const [nuevoCompromiso, setNuevoCompromiso] = useState({
    descripcion: '',
    fecha: '',
    responsable: ''
  });
  const [statusGCC, setStatusGCC] = useState<'PROCESO' | 'LOGRADO' | 'NO_ACUERDO'>('PROCESO');

  const casesInGCC = expedientes.filter(e => e.etapa === 'CERRADO_GCC' || e.etapa === 'INVESTIGACION'); // Casos aptos para mediación

  const activeCase = expedientes.find(e => e.id === selectedCaseId);

  const addCompromiso = () => {
    if (!nuevoCompromiso.descripcion || !nuevoCompromiso.fecha) return;
    const item: Compromiso = {
      id: Math.random().toString(36).substr(2, 9),
      descripcion: nuevoCompromiso.descripcion,
      fechaCumplimiento: nuevoCompromiso.fecha,
      responsable: nuevoCompromiso.responsable || 'Estudiante',
      completado: false
    };
    setCompromisos([...compromisos, item]);
    setNuevoCompromiso({ descripcion: '', fecha: '', responsable: '' });
  };

  const removeCompromiso = (id: string) => {
    setCompromisos(compromisos.filter(c => c.id !== id));
  };

  const handleCierreExitoso = () => {
    if (!selectedCaseId) return;
    setExpedientes(prev => prev.map(e => 
      e.id === selectedCaseId ? { ...e, etapa: 'CERRADO_GCC' } : e
    ));
    alert('Acta de Mediación generada. El proceso disciplinario ha sido cerrado por vía formativa.');
  };

  return (
    <main className="flex-1 p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-emerald-50/30 overflow-y-auto">
      {/* Header Mediación */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-4 bg-emerald-600 text-white rounded-[1.5rem] shadow-xl shadow-emerald-200">
            <Handshake className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Centro de Mediación Escolar (GCC)</h2>
            <p className="text-emerald-700 font-bold text-sm">Gestión de Conflictos con Enfoque Formativo - Circular 782</p>
          </div>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-emerald-100 shadow-sm flex items-center space-x-4">
           <div className="flex -space-x-2">
             {[1,2,3].map(i => (
               <div key={i} className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-emerald-600">
                 {String.fromCharCode(64 + i)}
               </div>
             ))}
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">3 Facilitadores Activos</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna Izquierda: Listado de Casos */}
        <section className="space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-emerald-100 shadow-xl shadow-emerald-200/20 p-8">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center">
              <Users className="w-5 h-5 mr-3 text-emerald-600" />
              Casos en Conciliación
            </h3>
            <div className="space-y-4">
              {casesInGCC.map(exp => (
                <button
                  key={exp.id}
                  onClick={() => setSelectedCaseId(exp.id)}
                  className={`w-full p-6 rounded-[1.5rem] border-2 transition-all text-left flex justify-between items-center group ${
                    selectedCaseId === exp.id 
                    ? 'border-emerald-500 bg-emerald-50' 
                    : 'border-slate-50 bg-white hover:border-emerald-200 hover:bg-emerald-50/30'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className={`text-xs font-black uppercase tracking-tight ${selectedCaseId === exp.id ? 'text-emerald-700' : 'text-slate-800'}`}>
                      {exp.nnaNombre}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 font-mono mt-1">{exp.id}</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${selectedCaseId === exp.id ? 'text-emerald-500 translate-x-1' : 'text-slate-200 group-hover:text-emerald-300'}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-emerald-600 text-white p-8 rounded-[2.5rem] shadow-2xl shadow-emerald-500/20 relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-all duration-700"></div>
            <h4 className="text-xl font-black uppercase tracking-tight mb-4">¿Por qué GCC?</h4>
            <p className="text-[11px] text-emerald-100 font-medium leading-relaxed mb-6">
              La Circular 782 prioriza la resolución pacífica. Un acuerdo logrado mediante GCC extingue la necesidad de medidas punitivas y fomenta la reparación real del daño.
            </p>
            <button className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
              Ver Guía de Mediación
            </button>
          </div>
        </section>

        {/* Columna Derecha: Panel de Trabajo de Mediación */}
        <section className="lg:col-span-2 space-y-8">
          {selectedCaseId ? (
            <div className="bg-white rounded-[2.5rem] border border-emerald-100 shadow-xl shadow-emerald-200/20 p-10 animate-in zoom-in-95 duration-500">
              
              {/* Notificación de Suspensión */}
              <div className="mb-10 p-6 bg-blue-50 border-2 border-blue-200 border-dashed rounded-[2rem] flex items-center space-x-6">
                <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h5 className="text-[10px] font-black text-blue-800 uppercase tracking-widest mb-1">Efecto Suspensivo Activo</h5>
                  <p className="text-[11px] text-blue-600 font-bold leading-tight">
                    Mientras este proceso de GCC esté en curso, el procedimiento disciplinario punitivo (Folio {selectedCaseId}) se mantiene en pausa legal.
                  </p>
                </div>
              </div>

              {/* Formulario de Participantes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Facilitador Responsable</label>
                  <input 
                    type="text" 
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/5 focus:outline-none focus:border-emerald-300 transition-all"
                    value={facilitador}
                    onChange={e => setFacilitador(e.target.value)}
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Estado del Acuerdo</label>
                  <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100">
                    {(['PROCESO', 'LOGRADO', 'NO_ACUERDO'] as const).map(s => (
                      <button 
                        key={s}
                        onClick={() => setStatusGCC(s)}
                        className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${
                          statusGCC === s 
                          ? 'bg-emerald-600 text-white shadow-lg' 
                          : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {s.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Panel de Compromisos Reparatorios */}
              <div className="space-y-6 mb-12">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-emerald-600" />
                    Compromisos Reparatorios
                  </h3>
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase">
                    {compromisos.length} Definidos
                  </span>
                </div>

                <div className="space-y-4">
                  {compromisos.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-6 bg-emerald-50/50 border border-emerald-100 rounded-[1.5rem] group hover:bg-emerald-50 transition-all">
                      <div className="flex items-center space-x-6">
                        <button className="p-2 bg-white rounded-xl border border-emerald-200 text-emerald-600 shadow-sm hover:bg-emerald-600 hover:text-white transition-all">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{c.descripcion}</p>
                          <div className="flex items-center mt-1 space-x-4">
                            <span className="text-[10px] font-black text-emerald-600 uppercase flex items-center">
                              <Users className="w-3 h-3 mr-1.5" /> {c.responsable}
                            </span>
                            <span className="text-[10px] font-black text-slate-400 uppercase flex items-center">
                              <Calendar className="w-3 h-3 mr-1.5" /> Plazo: {c.fechaCumplimiento}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => removeCompromiso(c.id)} className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Formulario para nuevo compromiso */}
                <div className="bg-slate-50 border border-dashed border-slate-200 rounded-[1.5rem] p-8 space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nuevo Compromiso de Mejora</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input 
                      type="text" 
                      placeholder="Ej: Disculpas públicas..." 
                      className="md:col-span-2 px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-300 transition-all"
                      value={nuevoCompromiso.descripcion}
                      onChange={e => setNuevoCompromiso({...nuevoCompromiso, descripcion: e.target.value})}
                    />
                    <input 
                      type="date" 
                      className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-300 transition-all"
                      value={nuevoCompromiso.fecha}
                      onChange={e => setNuevoCompromiso({...nuevoCompromiso, fecha: e.target.value})}
                    />
                    <select 
                      className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-300 transition-all"
                      value={nuevoCompromiso.responsable}
                      onChange={e => setNuevoCompromiso({...nuevoCompromiso, responsable: e.target.value})}
                    >
                      <option value="">Responsable...</option>
                      <option value="Estudiante">Estudiante</option>
                      <option value="Apoderado">Apoderado</option>
                      <option value="Docente">Docente</option>
                    </select>
                    <button 
                      onClick={addCompromiso}
                      className="md:col-span-3 flex items-center justify-center space-x-2 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-200 active:scale-95 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Agregar Compromiso</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Acciones Finales */}
              <div className="flex flex-col md:flex-row gap-6 pt-10 border-t border-slate-100">
                <button 
                  className="flex-1 py-5 rounded-[1.5rem] bg-white border-2 border-slate-100 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:border-emerald-300 hover:text-emerald-600 transition-all flex items-center justify-center space-x-3"
                >
                  <FileText className="w-5 h-5" />
                  <span>Previsualizar Acta</span>
                </button>
                <button 
                  onClick={handleCierreExitoso}
                  disabled={statusGCC !== 'LOGRADO'}
                  className={`flex-[2] py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center space-x-4 active:scale-95 ${
                    statusGCC === 'LOGRADO' 
                    ? 'bg-emerald-600 text-white shadow-emerald-600/20 hover:bg-emerald-700' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <ShieldCheck className="w-6 h-6" />
                  <span>Cierre Exitoso por Vía Formativa</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] border border-emerald-100 shadow-xl shadow-emerald-200/10 p-20 flex flex-col items-center justify-center text-center space-y-6 h-full">
              <div className="w-32 h-32 bg-emerald-50 text-emerald-300 rounded-[3rem] flex items-center justify-center mb-4">
                <Handshake className="w-16 h-16" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Sala de Conciliación GCC</h3>
                <p className="text-slate-400 font-bold text-sm mt-2 max-w-sm">
                  Seleccione un proceso del listado izquierdo para iniciar el diseño del acuerdo reparatorio.
                </p>
              </div>
              <div className="flex items-center space-x-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-full">
                <Info className="w-4 h-4" />
                <span>Solo casos en Etapa de Investigación o Notificación</span>
              </div>
            </div>
          )}
        </section>

      </div>
    </main>
  );
};

export default CentroMediacionGCC;
