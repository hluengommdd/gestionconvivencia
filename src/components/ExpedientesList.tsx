
import React, { useMemo, useState } from 'react';
import { useConvivencia } from '../context/ConvivenciaContext';
import NormativeBadge from './NormativeBadge';
import PlazoCounter from './PlazoCounter';
import { 
  Search, 
  Filter, 
  ArrowRight, 
  FileText, 
  MoreVertical,
  Download,
  FilePlus,
  Archive,
  Database
} from 'lucide-react';

const ExpedientesList: React.FC = () => {
  const { expedientes, setExpedienteSeleccionado, setIsWizardOpen } = useConvivencia();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredExpedientes = useMemo(() => {
    if (!searchTerm.trim()) return expedientes;
    const term = searchTerm.toLowerCase();
    return expedientes.filter(exp => 
      exp.nnaNombre.toLowerCase().includes(term) ||
      exp.id.toLowerCase().includes(term) ||
      exp.etapa.toLowerCase().includes(term)
    );
  }, [expedientes, searchTerm]);

  return (
    <main className="flex-1 flex flex-col bg-slate-50 h-full overflow-hidden animate-in fade-in duration-500">
      <header className="px-4 md:px-10 py-6 md:py-8 bg-white border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Archivo Maestro de Expedientes</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Base de datos integral de procesos disciplinarios</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsWizardOpen(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
          >
            <FilePlus className="w-4 h-4" />
            <span>Apertura de Folio</span>
          </button>
        </div>
      </header>

      <div className="p-4 md:p-10 flex-1 overflow-hidden flex flex-col space-y-6">
        <section className="bg-white p-4 md:p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center gap-4 md:space-x-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input 
              type="text" 
              placeholder="Buscar por nombre, folio, etapa o gravedad..." 
              className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center justify-center space-x-2 px-5 py-4 bg-white border border-slate-200 text-slate-500 rounded-2xl text-[10px] font-black uppercase hover:bg-slate-50 transition-all w-full md:w-auto">
            <Filter className="w-4 h-4" />
            <span>Filtros Avanzados</span>
          </button>
          <button className="p-4 bg-white border border-slate-200 text-slate-500 rounded-2xl hover:bg-slate-50 transition-all w-full md:w-auto">
            <Download className="w-5 h-5" />
          </button>
        </section>

        <div className="flex-1 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left">
              <thead>
                <tr className="text-[10px] text-slate-400 uppercase tracking-[0.2em] bg-slate-50/50 border-b border-slate-100">
                  <th className="px-4 md:px-10 py-5 font-black">Identificación</th>
                  <th className="px-4 md:px-10 py-5 font-black">Calificación Normativa</th>
                  <th className="px-4 md:px-10 py-5 font-black">Estado del Proceso</th>
                  <th className="px-4 md:px-10 py-5 font-black text-center">Docs</th>
                  <th className="px-4 md:px-10 py-5 font-black">Vencimiento</th>
                  <th className="px-4 md:px-10 py-5 text-right">Gestión</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredExpedientes.map((exp) => (
                  <tr 
                    key={exp.id} 
                    className="hover:bg-blue-50/40 transition-all group cursor-pointer"
                    onClick={() => setExpedienteSeleccionado(exp)}
                  >
                    <td className="px-4 md:px-10 py-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          {exp.id.split('-').pop()}
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-xs uppercase">{exp.nnaNombre}</p>
                          <p className="font-mono text-[9px] text-blue-500 font-bold uppercase">{exp.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-10 py-6">
                      <NormativeBadge gravedad={exp.gravedad} />
                    </td>
                    <td className="px-4 md:px-10 py-6">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${exp.etapa.startsWith('CERRADO') ? 'bg-emerald-500' : 'bg-blue-500 animate-pulse'}`}></div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{exp.etapa.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="px-4 md:px-10 py-6 text-center">
                      <div className="flex items-center justify-center -space-x-1.5">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm group-hover:border-blue-200">
                            <FileText className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500" />
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 md:px-10 py-6">
                      <PlazoCounter fechaLimite={exp.plazoFatal} />
                    </td>
                    <td className="px-4 md:px-10 py-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="p-2 text-slate-300 hover:text-blue-600 transition-colors"><MoreVertical className="w-4 h-4" /></button>
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1 shadow-sm">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredExpedientes.length === 0 && (
              <div className="py-24 text-center">
                <Archive className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-black text-xs uppercase tracking-widest">No se encontraron expedientes coincidentes</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default ExpedientesList;
