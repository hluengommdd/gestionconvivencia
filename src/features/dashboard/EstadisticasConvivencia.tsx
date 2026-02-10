import React, { useMemo } from 'react';
import { FileText, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Expediente } from '@/types';

/** Props para EstadisticasConvivencia */
interface EstadisticasConvivenciaProps {
  expedientes: Expediente[];
  onFilterByCourse?: (course: string | null) => void;
  currentFilter?: string | null;
}

/**
 * Componente de estadísticas con distribución por curso.
 * Permite ver la distribución de expedientes por curso y filtrar al hacer click.
 */
export const EstadisticasConvivencia: React.FC<EstadisticasConvivenciaProps> = ({
  expedientes,
  onFilterByCourse,
  currentFilter
}) => {
  // Calcular estadísticas por curso
  const statsByCourse = useMemo(() => {
    const courseMap = new Map<string, { total: number; leves: number; relevantes: number; graves: number }>();

    expedientes.forEach(exp => {
      const curso = exp.nnaCurso || 'Sin curso';
      const existing = courseMap.get(curso) || { total: 0, leves: 0, relevantes: 0, graves: 0 };

      existing.total += 1;
      if (exp.gravedad === 'LEVE') existing.leves += 1;
      else if (exp.gravedad === 'RELEVANTE') existing.relevantes += 1;
      else if (exp.gravedad === 'GRAVISIMA_EXPULSION') existing.graves += 1;

      courseMap.set(curso, existing);
    });

    return Array.from(courseMap.entries())
      .map(([curso, stats]) => ({ curso, ...stats }))
      .sort((a, b) => b.total - a.total);
  }, [expedientes]);

  // KPIs generales
  const kpis = useMemo(() => {
    const activos = expedientes.filter(e => 
      !['CERRADO_SANCION', 'CERRADO_GCC'].includes(e.etapa)
    );
    
    const proximosVencer = activos.filter(e => {
      const diasRestantes = Math.ceil(
        (new Date(e.plazoFatal).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      return diasRestantes > 0 && diasRestantes <= 5;
    });

    const resueltos = expedientes.filter(e => 
      ['CERRADO_SANCION', 'CERRADO_GCC'].includes(e.etapa)
    );

    return {
      total: expedientes.length,
      activos: activos.length,
      proximosVencer: proximosVencer.length,
      resueltos: resueltos.length
    };
  }, [expedientes]);

  // Colores para severity
  const getSeverityColor = (gravedad: string) => {
    switch (gravedad) {
      case 'LEVE': return 'bg-emerald-100 text-emerald-700';
      case 'RELEVANTE': return 'bg-amber-100 text-amber-700';
      case 'GRAVISIMA_EXPULSION': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* KPIs Generales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          title="Total"
          value={kpis.total}
          icon={<FileText className="w-6 h-6" />}
          color="blue"
        />
        <KPICard
          title="Activos"
          value={kpis.activos}
          icon={<Clock className="w-6 h-6" />}
          color="amber"
          onClick={() => onFilterByCourse?.(null)}
        />
        <KPICard
          title="Por Vencer"
          value={kpis.proximosVencer}
          icon={<AlertTriangle className="w-6 h-6" />}
          color="red"
        />
        <KPICard
          title="Resueltos"
          value={kpis.resueltos}
          icon={<CheckCircle className="w-6 h-6" />}
          color="emerald"
        />
      </div>

      {/* Distribución por Curso */}
      {statsByCourse.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">
              Distribución por Curso
            </h3>
            {currentFilter && (
              <button
                onClick={() => onFilterByCourse?.(null)}
                className="text-xs text-blue-600 hover:text-blue-700 font-bold uppercase"
              >
                Limpiar filtro
              </button>
            )}
          </div>

          <div className="space-y-3">
            {statsByCourse.map(({ curso, total, leves, relevantes, graves }) => {
              const isActive = currentFilter === curso;

              return (
                <button
                  key={curso}
                  onClick={() => onFilterByCourse?.(isActive ? null : curso)}
                  className={`w-full text-left p-3 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-blue-50 border-2 border-blue-200' 
                      : 'bg-slate-50 hover:bg-slate-100 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-800">{curso}</span>
                    <span className="text-sm font-black text-slate-600">{total}</span>
                  </div>
                  
                  {/* Barra de progreso */}
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden flex">
                    <div 
                      className="h-full bg-emerald-400" 
                      style={{ width: `${(leves / total) * 100}%` }}
                    />
                    <div 
                      className="h-full bg-amber-400" 
                      style={{ width: `${(relevantes / total) * 100}%` }}
                    />
                    <div 
                      className="h-full bg-red-400" 
                      style={{ width: `${(graves / total) * 100}%` }}
                    />
                  </div>

                  {/* Detalle de gravedad */}
                  <div className="flex gap-3 mt-2 text-xs">
                    <span className={`px-2 py-0.5 rounded-full ${getSeverityColor('LEVE')}`}>
                      L: {leves}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full ${getSeverityColor('RELEVANTE')}`}>
                      R: {relevantes}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full ${getSeverityColor('GRAVISIMA_EXPULSION')}`}>
                      G: {graves}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Leyenda */}
      <div className="flex items-center justify-center gap-6 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-400" />
          <span>Leve</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <span>Relevante</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <span>Grave (Expulsión)</span>
        </div>
      </div>
    </div>
  );
};

/** KPI Card individual */
interface KPICardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue' | 'red' | 'emerald' | 'amber';
  onClick?: () => void;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, icon, color, onClick }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-500 text-white',
    emerald: 'bg-emerald-500 text-white',
    amber: 'bg-amber-500 text-white',
  };

  return (
    <button
      onClick={onClick}
      className={`bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4 hover:shadow-md transition-all ${
        onClick ? 'cursor-pointer hover:border-blue-200' : ''
      }`}
    >
      <div className={`p-3 rounded-xl ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-black text-slate-900">{value}</p>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
      </div>
    </button>
  );
};

export default EstadisticasConvivencia;
