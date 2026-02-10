
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConvivencia } from '@/shared/context/ConvivenciaContext';
import { useExpedientes } from '@/shared/hooks';
import NormativeBadge from '@/shared/components/NormativeBadge';
import PlazoCounter from '@/shared/components/PlazoCounter';
import { EstudianteBadge } from '@/shared/components/EstudianteBadge';
import { EstadisticasConvivencia } from './EstadisticasConvivencia';
import { FilePlus, ArrowRight, Files, Search, FilterX } from 'lucide-react';

/**
 * Componente ExpedienteCard para vista móvil
 */
const ExpedienteCard: React.FC<{
  exp: { id: string; nnaNombre: string; nnaCurso?: string | null; gravedad: string; etapa: string; plazoFatal: string };
  onClick: () => void;
}> = ({ exp, onClick }) => (
  <button
    onClick={onClick}
    className="w-full text-left bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 hover:border-blue-200"
  >
    <div className="flex items-center justify-between">
      <span className="font-mono text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100">
        {exp.id}
      </span>
      <NormativeBadge gravedad={exp.gravedad as any} />
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase">Estudiante</p>
      <EstudianteBadge
        nombre={exp.nnaNombre}
        curso={exp.nnaCurso}
        size="sm"
      />
    </div>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase">Etapa</p>
        <p className="text-[10px] font-black text-slate-600 uppercase">{exp.etapa.replace('_', ' ')}</p>
      </div>
      <PlazoCounter fechaLimite={exp.plazoFatal} />
    </div>
  </button>
);

/**
 * Componente EmptyState para cuando no hay resultados
 */
const EmptyState: React.FC<{ searchTerm: string }> = ({ searchTerm }) => (
  <div className="px-4 py-12 text-center space-y-3">
    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto text-slate-300 shadow-sm">
      {searchTerm ? <FilterX className="w-8 h-8" /> : <Files className="w-8 h-8" />}
    </div>
    <p className="text-slate-800 font-black text-xs uppercase tracking-widest">
      {searchTerm ? 'Sin coincidencias' : 'No hay expedientes'}
    </p>
  </div>
);

/**
 * Dashboard principal con estadísticas y distribución por curso
 */
const Dashboard: React.FC = () => {
  const { expedientes, setIsWizardOpen } = useConvivencia();
  const { filteredExpedientes, searchTerm, setSearchTerm } = useExpedientes(expedientes);
  const navigate = useNavigate();
  const [courseFilter, setCourseFilter] = useState<string | null>(null);

  // Filtrar por curso si está activo
  const displayedExpedientes = courseFilter
    ? filteredExpedientes.filter(exp => exp.nnaCurso === courseFilter)
    : filteredExpedientes;

  return (
    <main className="flex-1 p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-slate-50 overflow-y-auto custom-scrollbar">
      {/* Header */}
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

      {/* Estadísticas con filtros por curso */}
      <EstadisticasConvivencia
        expedientes={expedientes}
        onFilterByCourse={(course) => setCourseFilter(course)}
        currentFilter={courseFilter}
      />

      {/* Tabla de Seguimiento */}
      <section className="bg-white border border-slate-200 rounded-[2.5rem] shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col">
        {/* Barra de filtros */}
        <div className="p-4 md:p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-50/40">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-8 bg-blue-600 rounded-full"></div>
            <h3 className="font-black text-slate-800 text-lg md:text-xl tracking-tight uppercase">
              {courseFilter ? `Expedientes: ${courseFilter}` : 'Expedientes en Seguimiento'}
            </h3>
            {courseFilter && (
              <button
                onClick={() => setCourseFilter(null)}
                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full hover:bg-blue-200"
              >
                ✕ Limpiar
              </button>
            )}
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

        {/* Vista móvil */}
        <div className="md:hidden p-4 space-y-4">
          {displayedExpedientes.length > 0 ? (
            displayedExpedientes.map((exp) => (
              <ExpedienteCard
                key={exp.id}
                exp={exp}
                onClick={() => navigate(`/expedientes/${exp.id}`)}
              />
            ))
          ) : (
            <EmptyState searchTerm={searchTerm} />
          )}
        </div>

        {/* Vista escritorio */}
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
              {displayedExpedientes.length > 0 ? (
                displayedExpedientes.map((exp) => (
                  <tr
                    key={exp.id}
                    className="hover:bg-blue-50/40 transition-all group cursor-pointer"
                    onClick={() => navigate(`/expedientes/${exp.id}`)}
                  >
                    <td className="px-4 md:px-10 py-6">
                      <span className="font-mono text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100">
                        {exp.id}
                      </span>
                    </td>
                    <td className="px-4 md:px-10 py-6">
                      <div className="flex items-center space-x-4">
                        <EstudianteBadge
                          nombre={exp.nnaNombre}
                          curso={exp.nnaCurso}
                          size="md"
                          showIcon={true}
                        />
                      </div>
                    </td>
                    <td className="px-4 md:px-10 py-6">
                      <NormativeBadge gravedad={exp.gravedad as any} />
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
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 md:px-10 py-12 md:py-20">
                    <div className="text-center space-y-4 bg-slate-50/20 py-12 rounded-2xl">
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
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
};

export default Dashboard;
