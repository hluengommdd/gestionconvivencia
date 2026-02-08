
import React, { useState, useMemo } from 'react';
import { 
  HeartHandshake, 
  ClipboardList, 
  CheckCircle, 
  Clock, 
  User, 
  FileText, 
  Download, 
  Search, 
  Plus, 
  ChevronRight, 
  Filter, 
  MoreVertical,
  Calendar,
  ShieldCheck,
  AlertCircle,
  X
} from 'lucide-react';
import { useConvivencia } from '../context/ConvivenciaContext';

interface AccionApoyo {
  id: string;
  nnaNombre: string;
  fecha: string;
  accion: string;
  tipo: 'PEDAGOGICO' | 'PSICOSOCIAL';
  responsable: string;
  objetivo: string;
  resultados: string;
  estado: 'REALIZADA' | 'PENDIENTE';
  evidenciaUrl: string;
}

const PROFESIONALES_LIST = [
  "Ps. Ana María - Psicóloga",
  "Prof. Juan - Profesor Jefe",
  "Sra. Marta - Inspectora General",
  "Sr. Ricardo - Orientador",
  "Dupla Psicosocial - SGE",
  "Director - Juan Director"
];

const SeguimientoApoyo: React.FC = () => {
  const { expedientes } = useConvivencia();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<'TODOS' | 'PEDAGOGICO' | 'PSICOSOCIAL'>('TODOS');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Datos Mock de Acompañamiento
  const [acciones, setAcciones] = useState<AccionApoyo[]>([
    {
      id: 'ACC-001',
      nnaNombre: 'A. Rojas B.',
      fecha: '2025-05-02',
      accion: 'Entrevista Individual con Psicólogo',
      tipo: 'PSICOSOCIAL',
      responsable: 'Ps. Ana María - Psicóloga',
      objetivo: 'Identificar detonantes de conducta impulsiva en el aula.',
      resultados: 'El estudiante muestra apertura y reconoce factores de estrés en el hogar.',
      estado: 'REALIZADA',
      evidenciaUrl: '#'
    },
    {
      id: 'ACC-002',
      nnaNombre: 'A. Rojas B.',
      fecha: '2025-05-05',
      accion: 'Taller de Convivencia y Empatía',
      tipo: 'PEDAGOGICO',
      responsable: 'Prof. Juan - Profesor Jefe',
      objetivo: 'Fortalecer vínculos de confianza con el grupo de pares.',
      resultados: 'Participación activa pero con dificultades de concentración.',
      estado: 'REALIZADA',
      evidenciaUrl: '#'
    }
  ]);

  // Formulario nueva acción
  const [newAction, setNewAction] = useState({
    nnaNombre: '',
    tipo: 'PEDAGOGICO' as 'PEDAGOGICO' | 'PSICOSOCIAL',
    accion: '',
    responsable: '',
    objetivo: ''
  });

  const handleSaveAction = () => {
    const action: AccionApoyo = {
      id: `ACC-${Math.floor(Math.random() * 1000)}`,
      nnaNombre: newAction.nnaNombre || 'Estudiante General',
      fecha: new Date().toISOString().split('T')[0],
      accion: newAction.accion,
      tipo: newAction.tipo,
      responsable: newAction.responsable,
      objetivo: newAction.objetivo,
      resultados: 'Pendiente de ejecución',
      estado: 'PENDIENTE',
      evidenciaUrl: ''
    };
    setAcciones([action, ...acciones]);
    setIsModalOpen(false);
    setNewAction({ nnaNombre: '', tipo: 'PEDAGOGICO', accion: '', responsable: '', objetivo: '' });
  };

  const filteredAcciones = useMemo(() => {
    return acciones.filter(acc => {
      const matchSearch = acc.nnaNombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          acc.accion.toLowerCase().includes(searchTerm.toLowerCase());
      const matchTipo = filterTipo === 'TODOS' || acc.tipo === filterTipo;
      return matchSearch && matchTipo;
    });
  }, [acciones, searchTerm, filterTipo]);

  const complianceSample = useMemo(() => {
    const totalReq = 3;
    const count = acciones.filter(a => a.nnaNombre === 'A. Rojas B.' && a.estado === 'REALIZADA').length;
    return { count, total: totalReq, pct: Math.min((count / totalReq) * 100, 100) };
  }, [acciones]);

  return (
    <main className="flex-1 flex flex-col bg-slate-100 overflow-hidden animate-in fade-in duration-700 relative">
      
      {/* Modal Nueva Acción */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in zoom-in-95">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden">
            <header className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
                  <Plus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase">Registrar Acción de Apoyo</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Gradualidad y Acompañamiento</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors"><X className="w-6 h-6" /></button>
            </header>
            
            <div className="p-10 space-y-6 overflow-y-auto max-h-[70vh]">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estudiante</label>
                <input 
                  type="text" 
                  placeholder="Nombre del estudiante..." 
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 focus:outline-none"
                  value={newAction.nnaNombre}
                  onChange={e => setNewAction({...newAction, nnaNombre: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Naturaleza</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                    value={newAction.tipo}
                    onChange={e => setNewAction({...newAction, tipo: e.target.value as any})}
                  >
                    <option value="PEDAGOGICO">Pedagógico</option>
                    <option value="PSICOSOCIAL">Psicosocial</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Responsable de la Acción</label>
                  <div className="relative">
                    <input 
                      list="profesionales-data"
                      placeholder="Seleccione o escriba..."
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-4 focus:ring-indigo-500/5 focus:outline-none"
                      value={newAction.responsable}
                      onChange={e => setNewAction({...newAction, responsable: e.target.value})}
                    />
                    <datalist id="profesionales-data">
                      {PROFESIONALES_LIST.map(p => <option key={p} value={p} />)}
                    </datalist>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descripción de la Acción</label>
                <input 
                  type="text" 
                  placeholder="Ej: Reunión de contención, Taller grupal..." 
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none"
                  value={newAction.accion}
                  onChange={e => setNewAction({...newAction, accion: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Objetivo Técnico</label>
                <textarea 
                  className="w-full h-24 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none resize-none"
                  placeholder="¿Qué se busca lograr con esta intervención?"
                  value={newAction.objetivo}
                  onChange={e => setNewAction({...newAction, objetivo: e.target.value})}
                />
              </div>
            </div>

            <footer className="p-8 border-t border-slate-100 bg-slate-50 flex justify-end">
               <button 
                 onClick={handleSaveAction}
                 className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95"
               >
                 Guardar e Indexar
               </button>
            </footer>
          </div>
        </div>
      )}
      
      {/* Header Principal */}
      <header className="px-10 py-8 bg-white border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="p-4 bg-indigo-600 text-white rounded-[1.5rem] shadow-xl shadow-indigo-200">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Seguimiento de Apoyo Estudiantil</h2>
            <p className="text-indigo-600 font-bold text-[10px] uppercase tracking-widest">Gradualidad y Acompañamiento - Circular 782</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
           <button className="flex items-center space-x-2 px-6 py-3 bg-white border-2 border-slate-100 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-indigo-300 hover:text-indigo-600 transition-all shadow-sm">
              <Download className="w-4 h-4" />
              <span>Exportar Historial PDF</span>
           </button>
           <button 
             onClick={() => setIsModalOpen(true)}
             className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95"
           >
              <Plus className="w-4 h-4" />
              <span>Registrar Nueva Acción</span>
           </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Panel Izquierdo: Timeline y Filtros */}
        <div className="flex-1 flex flex-col overflow-hidden p-10 space-y-8">
          
          {/* Barra de Búsqueda y Filtros */}
          <section className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6">
             <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input 
                  type="text" 
                  placeholder="Buscar por estudiante o acción pedagógica..." 
                  className="w-full pl-12 pr-6 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
             </div>
             <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                {(['TODOS', 'PEDAGOGICO', 'PSICOSOCIAL'] as const).map(t => (
                  <button 
                    key={t}
                    onClick={() => setFilterTipo(t)}
                    className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${filterTipo === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {t}
                  </button>
                ))}
             </div>
          </section>

          {/* Listado Timeline */}
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 flex items-center">
              <Calendar className="w-4 h-4 mr-2" /> Cronología de Intervenciones
            </h3>
            
            <div className="relative space-y-1">
              <div className="absolute left-10 top-0 bottom-0 w-1 bg-slate-200/50 rounded-full z-0"></div>
              
              {filteredAcciones.map((acc) => (
                <div key={acc.id} className="relative z-10 flex items-start space-x-8 group">
                  <div className={`mt-4 w-5 h-5 rounded-full border-4 border-white flex-shrink-0 shadow-md ${acc.estado === 'REALIZADA' ? 'bg-emerald-500' : 'bg-amber-400'}`}></div>
                  <div className="flex-1 bg-white border border-slate-200 p-8 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 group-hover:-translate-y-1">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-2xl ${acc.tipo === 'PEDAGOGICO' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'}`}>
                           {acc.tipo === 'PEDAGOGICO' ? <ClipboardList className="w-6 h-6" /> : <HeartHandshake className="w-6 h-6" />}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">{acc.nnaNombre}</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{acc.accion}</p>
                        </div>
                      </div>
                      <div className="text-right">
                         <span className="text-[10px] font-black text-slate-400 block mb-1">{acc.fecha}</span>
                         <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${acc.estado === 'REALIZADA' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                           {acc.estado}
                         </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-50">
                       <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Objetivo</p>
                          <p className="text-xs font-bold text-slate-600 leading-relaxed">{acc.objetivo}</p>
                       </div>
                       <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Responsable</p>
                          <div className="flex items-center space-x-2">
                             <User className="w-3.5 h-3.5 text-indigo-400" />
                             <span className="text-xs font-bold text-slate-600">{acc.responsable}</span>
                          </div>
                       </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                       <div className="flex items-center space-x-4">
                          <button className="flex items-center space-x-2 text-[9px] font-black text-indigo-600 uppercase hover:underline">
                             <FileText className="w-4 h-4" />
                             <span>Ver Acta Firmada</span>
                          </button>
                       </div>
                       <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                          <MoreVertical className="w-4 h-4" />
                       </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel Derecho: Auditoría y Verificación SIE */}
        <aside className="w-96 bg-white border-l border-slate-200 p-8 flex flex-col shrink-0 space-y-8 overflow-y-auto">
          
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
             <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-500/20 transition-all"></div>
             <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                   <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-400">Verificación SIE</h3>
                   <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                
                <div className="text-center space-y-3 mb-8">
                   <h4 className="text-4xl font-black tracking-tighter">{complianceSample.count}/{complianceSample.total}</h4>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Acciones Documentadas</p>
                </div>

                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-6">
                   <div 
                     className="h-full bg-emerald-500 transition-all duration-1000" 
                     style={{ width: `${complianceSample.pct}%` }}
                   ></div>
                </div>

                <div className={`p-4 rounded-2xl flex items-center space-x-4 border border-dashed transition-all ${complianceSample.pct >= 100 ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-white/5 border-white/10'}`}>
                   {complianceSample.pct >= 100 ? (
                     <>
                        <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
                        <p className="text-[10px] font-bold text-emerald-400 leading-tight uppercase">Suficiencia de gradualidad alcanzada para proceso grave.</p>
                     </>
                   ) : (
                     <>
                        <AlertCircle className="w-6 h-6 text-amber-400 shrink-0" />
                        <p className="text-[10px] font-bold text-amber-400 leading-tight uppercase">Se requiere mayor evidencia de acompañamiento previo.</p>
                     </>
                   )}
                </div>
             </div>
          </div>

          <div className="flex-1 space-y-6">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                <Filter className="w-4 h-4 mr-2" /> Requisitos por NNA
             </h3>
             
             <div className="space-y-3">
                {expedientes.filter(e => e.etapa !== 'CERRADO_GCC').map(exp => (
                  <button key={exp.id} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl text-left hover:border-indigo-300 transition-all group">
                     <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-black text-slate-800 uppercase tracking-tight">{exp.nnaNombre}</span>
                        <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-indigo-600 transition-all" />
                     </div>
                     <div className="flex items-center space-x-3">
                        <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                           <div className="h-full bg-indigo-600" style={{ width: '40%' }}></div>
                        </div>
                        <span className="text-[9px] font-black text-slate-400">2/3</span>
                     </div>
                  </button>
                ))}
             </div>
          </div>

          <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl space-y-3">
             <h5 className="text-[10px] font-black text-blue-800 uppercase flex items-center">
                <FileText className="w-4 h-4 mr-2" /> Glosario de Apoyos
             </h5>
             <p className="text-[9px] text-blue-600 font-medium leading-relaxed italic">
                * Las medidas deben ser proporcionales a la edad, desarrollo y naturaleza de la conducta. Documentar el proceso es fundamental para evitar la nulidad por falta de gradualidad.
             </p>
          </div>

        </aside>

      </div>
    </main>
  );
};

export default SeguimientoApoyo;
