
import React, { useMemo, useState } from 'react';
import { useConvivencia } from '../context/ConvivenciaContext';
import NormativeBadge from './NormativeBadge';
import PlazoCounter from './PlazoCounter';
import { 
  FilePlus, 
  ArrowRight, 
  AlertCircle, 
  Files,
  Activity,
  Search,
  CheckCircle2,
  FilterX
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { expedientes, setExpedienteSeleccionado, setIsWizardOpen } = useConvivencia();
  const [searchTerm, setSearchTerm] = useState('');

  // KPIs calculados dinámicamente
  const kpis = useMemo(() => {
    const ahora = new Date().getTime();
    const cuarentaYOchoHoras = 48 * 60 * 60 * 1000;

    return {
      activos: expedientes.filter(e => e.etapa !== 'CERRADO_SANCION' && e.etapa !== 'CERRADO_GCC').length,
      vencimientosCriticos: expedientes.filter(e => {
        if (e.etapa === 'CERRADO_SANCION' || e.etapa === 'CERRADO_GCC') return false;
        const limite = new Date(e.plazoFatal).getTime();
        const diff = limite - ahora;
        return diff > 0 && diff < cuarentaYOchoHoras;
      }).length,
      acuerdosGCC: expedientes.filter(e => e.etapa === 'CERRADO_GCC').length
    };
  }, [expedientes]);

  // Filtrado de expedientes por término de búsqueda
  const filteredExpedientes = useMemo(() => {
    if (!searchTerm.trim()) return expedientes;
    const term = searchTerm.toLowerCase();
    return expedientes.filter(exp => 
      exp.nnaNombre.toLowerCase().includes(term) ||
      exp.id.toLowerCase().includes(term) ||
      exp.gravedad.toLowerCase().includes(term) ||
      exp.etapa.toLowerCase().includes(term)
    );
  }, [expedientes, searchTerm]);

  return (
    <main className="flex-1 p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-slate-50 overflow-y-auto custom-scrollbar">
      {/* Header Dashboard */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Panel de Gestión Normativa</h2>
          <p className="text-slate-500 font-medium text-xs md:text-sm">Control Operativo de Circulares 781 & 782</p>
        </div>
        <button 
          onClick={() => setIsWizardOpen(true)}
          className="flex items-center space-x-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-2xl font-black shadow-xl shadow-blue-500/20 transition-all active:scale-95 group"
        >
          <FilePlus className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="text-xs tracking-widest uppercase">Nuevo Proceso Legal</span>
        </button>
      </header>

      {/* Tarjetas KPI Superiores */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-5 hover:shadow-md transition-shadow">
          <div className="p-4 rounded-2xl bg-blue-50 text-blue-600">
            <Activity className="w-7 h-7" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-0.5">Casos Activos</p>
            <h3 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tighter">{kpis.activos}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-red-100 shadow-sm flex items-center space-x-5 hover:bg-red-50/30 transition-all ring-2 ring-red-500/10">
          <div className="p-4 rounded-2xl bg-red-500 text-white shadow-lg shadow-red-200">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div>
            <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.15em] mb-0.5">Vencimientos &lt; 48h</p>
            <h3 className="text-2xl md:text-3xl font-black text-red-600 tracking-tighter">{kpis.vencimientosCriticos}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm flex items-center space-x-5 hover:bg-emerald-50/30 transition-all ring-2 ring-emerald-500/10">
          <div className="p-4 rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-200">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.15em] mb-0.5">Acuerdos GCC</p>
            <h3 className="text-2xl md:text-3xl font-black text-emerald-700 tracking-tighter">{kpis.acuerdosGCC}</h3>
          </div>
        </div>
      </section>

      {/* Tabla de Seguimiento */}
      <section className="bg-white border border-slate-200 rounded-[2.5rem] shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col">
        {/* Barra de Filtros de la Tabla */}
        <div className="p-4 md:p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-50/40">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-8 bg-blue-600 rounded-full"></div>
            <h3 className="font-black text-slate-800 text-lg md:text-xl tracking-tight uppercase">Expedientes en Seguimiento</h3>
          </div>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por nombre, folio o gravedad..." 
              className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Cuerpo de la Tabla */}
        <div className="md:hidden p-4 space-y-4">
          {filteredExpedientes.map((exp) => (
            <button
              key={exp.id}
              onClick={() => setExpedienteSeleccionado(exp)}
              className="w-full text-left bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 hover:border-blue-200"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100">
                  {exp.id}
                </span>
                <NormativeBadge gravedad={exp.gravedad} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">Estudiante</p>
                <p className="text-xs font-black text-slate-800 uppercase">{exp.nnaNombre}</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Etapa</p>
                  <p className="text-[10px] font-black text-slate-600 uppercase">{exp.etapa.replace('_', ' ')}</p>
                </div>
                <PlazoCounter fechaLimite={exp.plazoFatal} />
              </div>
            </button>
          ))}
          {filteredExpedientes.length === 0 && (
            <div className="px-4 py-12 text-center space-y-3">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto text-slate-300 shadow-sm">
                {searchTerm ? <FilterX className="w-8 h-8" /> : <Files className="w-8 h-8" />}
              </div>
              <p className="text-slate-800 font-black text-xs uppercase tracking-widest">
                {searchTerm ? 'Sin coincidencias' : 'No hay expedientes'}
              </p>
            </div>
          )}
        </div>
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead>
              <tr className="text-[10px] text-slate-400 uppercase tracking-[0.2em] bg-slate-50/50 border-b border-slate-100">
                <th className="px-4 md:px-10 py-5 font-black">Folio</th>
                <th className="px-4 md:px-10 py-5 font-black">Estudiante (NNA)</th>
                <th className="px-4 md:px-10 py-5 font-black">Gravedad</th>
                <th className="px-4 md:px-10 py-5 font-black">Etapa Legal</th>
                <th className="px-4 md:px-10 py-5 font-black">Plazo Fatal</th>
                <th className="px-4 md:px-10 py-5 font-black text-right">Detalle</th>
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
                    <span className="font-mono text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100">
                      {exp.id}
                    </span>
                  </td>
                  <td className="px-4 md:px-10 py-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-11 h-11 rounded-[1.2rem] bg-slate-100 border border-slate-200 flex items-center justify-center text-xs text-slate-500 font-black shadow-sm group-hover:scale-110 transition-transform">
                        {exp.nnaNombre.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-slate-700 text-sm uppercase tracking-tight">{exp.nnaNombre}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">7° Básico A</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-10 py-6">
                    <NormativeBadge gravedad={exp.gravedad} />
                  </td>
                  <td className="px-4 md:px-10 py-6">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${exp.etapa.startsWith('CERRADO') ? 'bg-emerald-500' : 'bg-blue-500 animate-pulse'}`}></div>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">
                        {exp.etapa.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 md:px-10 py-6">
                    <PlazoCounter fechaLimite={exp.plazoFatal} />
                  </td>
                  <td className="px-4 md:px-10 py-6 text-right">
                    <div className="inline-flex items-center justify-center w-10 h-10 text-blue-600 bg-blue-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-sm group-hover:translate-x-1">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredExpedientes.length === 0 && (
            <div className="px-4 md:px-10 py-12 md:py-20 text-center space-y-4 bg-slate-50/20">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto text-slate-300 shadow-sm">
                {searchTerm ? <FilterX className="w-10 h-10" /> : <Files className="w-10 h-10" />}
              </div>
              <div>
                <p className="text-slate-800 font-black text-sm uppercase tracking-widest">
                  {searchTerm ? 'Sin coincidencias' : 'No hay expedientes'}
                </p>
                <p className="text-slate-400 font-bold text-[10px] uppercase mt-1 tracking-tight italic">
                  {searchTerm ? `No encontramos resultados para "${searchTerm}"` : 'No se han detectado procesos disciplinarios activos.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default Dashboard;
