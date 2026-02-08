
import React, { useState, useMemo } from 'react';
import { useConvivencia } from '../context/ConvivenciaContext';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle, 
  Clock, 
  Info, 
  Gavel, 
  Users,
  Search,
  Bell,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { Expediente } from '../types';

interface Evento {
  date: string;
  type: 'FATAL' | 'DESCARGOS' | 'INTERNO' | 'GCC';
  title: string;
  expedienteId: string;
  nna: string;
}

const CalendarioPlazosLegales: React.FC = () => {
  const { expedientes, setExpedienteSeleccionado } = useConvivencia();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filters, setFilters] = useState({
    expulsion: true,
    reconsideracion: true,
    mediaciones: true,
    internos: true
  });

  // Generar eventos basados en expedientes
  const eventos: Evento[] = useMemo(() => {
    const list: Evento[] = [];
    expedientes.forEach(exp => {
      // Plazo Fatal (Vencimiento de Proceso)
      if (filters.expulsion && exp.gravedad === 'GRAVISIMA_EXPULSION') {
        list.push({
          date: exp.plazoFatal.split('T')[0],
          type: 'FATAL',
          title: 'Cierre Aula Segura',
          expedienteId: exp.id,
          nna: exp.nnaNombre
        });
      } else if (filters.reconsideracion) {
        list.push({
          date: exp.plazoFatal.split('T')[0],
          type: 'FATAL',
          title: 'Vencimiento Legal',
          expedienteId: exp.id,
          nna: exp.nnaNombre
        });
      }

      // Hito de Descargos (Simulado 3 días después del inicio si no está completo)
      const fechaDescargos = new Date(exp.fechaInicio);
      fechaDescargos.setDate(fechaDescargos.getDate() + 3);
      if (exp.etapa === 'NOTIFICADO') {
        list.push({
          date: fechaDescargos.toISOString().split('T')[0],
          type: 'DESCARGOS',
          title: 'Cierre Descargos',
          expedienteId: exp.id,
          nna: exp.nnaNombre
        });
      }

      // GCC
      if (filters.mediaciones && exp.etapa === 'CERRADO_GCC') {
         list.push({
          date: exp.fechaInicio.split('T')[0],
          type: 'GCC',
          title: 'Acuerdo Formativo',
          expedienteId: exp.id,
          nna: exp.nnaNombre
        });
      }
    });
    return list;
  }, [expedientes, filters]);

  // Lógica de Calendario
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);
  
  const monthName = currentDate.toLocaleString('es-CL', { month: 'long' });

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Urgencias de Hoy
  const urgenciasHoy = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return eventos.filter(e => e.date === todayStr);
  }, [eventos]);

  const renderDay = (dayNumber: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
    const dayEvents = eventos.filter(e => e.date === dateStr);
    const isToday = new Date().toISOString().split('T')[0] === dateStr;

    return (
      <div key={dayNumber} className={`min-h-[120px] bg-white border border-slate-100 p-2 flex flex-col space-y-1 transition-all hover:bg-slate-50/50 ${isToday ? 'ring-2 ring-blue-500 ring-inset bg-blue-50/20' : ''}`}>
        <div className="flex justify-between items-center mb-1">
          <span className={`text-[10px] font-black ${isToday ? 'text-blue-600' : 'text-slate-400'}`}>{dayNumber}</span>
          {isToday && <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>}
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col space-y-1">
          {dayEvents.map((ev, idx) => (
            <button
              key={`${ev.expedienteId}-${idx}`}
              onClick={() => {
                const exp = expedientes.find(e => e.id === ev.expedienteId);
                if (exp) setExpedienteSeleccionado(exp);
              }}
              className={`text-[8px] font-black uppercase p-1.5 rounded-lg border text-left truncate transition-transform active:scale-95 ${
                ev.type === 'FATAL' ? 'bg-red-50 text-red-700 border-red-200' :
                ev.type === 'DESCARGOS' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                ev.type === 'GCC' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                'bg-blue-50 text-blue-700 border-blue-200'
              }`}
            >
              {ev.title} - {ev.nna}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <main className="flex-1 flex overflow-hidden bg-slate-50">
      {/* Panel de Calendario */}
      <div className="flex-1 p-8 flex flex-col space-y-6 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <CalendarIcon className="w-6 h-6 text-blue-600" />
              <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Calendario Normativo</h2>
            </div>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest flex items-center">
              <Clock className="w-4 h-4 mr-2 text-blue-400" />
              Cálculo basado en días hábiles (Chile)
            </p>
          </div>

          <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1 shadow-sm">
            <button onClick={handlePrevMonth} className="p-3 hover:bg-slate-100 rounded-xl transition-all"><ChevronLeft className="w-5 h-5" /></button>
            <div className="px-8 text-sm font-black text-slate-900 uppercase tracking-widest w-40 text-center">
              {monthName} {year}
            </div>
            <button onClick={handleNextMonth} className="p-3 hover:bg-slate-100 rounded-xl transition-all"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </header>

        {/* Leyenda y Filtros */}
        <section className="flex flex-wrap gap-4 items-center bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
           <div className="flex items-center space-x-6 pr-6 border-r border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-[9px] font-black uppercase text-slate-500">Plazo Fatal</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span className="text-[9px] font-black uppercase text-slate-500">Descargos</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-[9px] font-black uppercase text-slate-500">Hito Interno</span>
              </div>
           </div>

           <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input type="checkbox" checked={filters.expulsion} onChange={e => setFilters({...filters, expulsion: e.target.checked})} className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                <span className="text-[9px] font-black uppercase text-slate-400 group-hover:text-slate-600 transition-colors">Expulsiones</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input type="checkbox" checked={filters.reconsideracion} onChange={e => setFilters({...filters, reconsideracion: e.target.checked})} className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                <span className="text-[9px] font-black uppercase text-slate-400 group-hover:text-slate-600 transition-colors">Reconsideración</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input type="checkbox" checked={filters.mediaciones} onChange={e => setFilters({...filters, mediaciones: e.target.checked})} className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                <span className="text-[9px] font-black uppercase text-slate-400 group-hover:text-slate-600 transition-colors">Mediaciones</span>
              </label>
           </div>
        </section>

        {/* Cuadrícula del Calendario */}
        <div className="bg-slate-200 grid grid-cols-7 gap-[1px] rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-2xl">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
            <div key={day} className="bg-slate-50 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">
              {day}
            </div>
          ))}
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-slate-50/50 min-h-[120px]"></div>
          ))}
          {Array.from({ length: totalDays }).map((_, i) => renderDay(i + 1))}
        </div>
      </div>

      {/* Panel Lateral de Urgencias */}
      <aside className="w-96 bg-white border-l border-slate-200 p-8 flex flex-col shrink-0 overflow-y-auto space-y-8">
        <div>
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center">
            <Bell className="w-5 h-5 mr-3 text-red-500 animate-bounce" />
            Urgencias para Hoy
          </h3>

          <div className="space-y-4">
            {urgenciasHoy.length > 0 ? urgenciasHoy.map((urg, idx) => (
              <div key={idx} className="bg-white border-2 border-slate-100 p-5 rounded-[1.5rem] hover:border-red-200 hover:bg-red-50/10 transition-all cursor-pointer group" onClick={() => {
                const exp = expedientes.find(e => e.id === urg.expedienteId);
                if (exp) setExpedienteSeleccionado(exp);
              }}>
                <div className="flex justify-between items-start mb-3">
                  <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase ${urg.type === 'FATAL' ? 'bg-red-600 text-white' : 'bg-amber-100 text-amber-700'}`}>
                    {urg.type}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 font-mono">{urg.expedienteId}</span>
                </div>
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight mb-1 group-hover:text-red-700 transition-colors">{urg.title}</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{urg.nna}</p>
                <div className="mt-4 flex items-center justify-end text-[9px] font-black text-blue-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                  <span>Ir al expediente</span>
                  <ChevronRight className="w-3 h-3 ml-1" />
                </div>
              </div>
            )) : (
              <div className="p-10 text-center space-y-4 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                  No se registran vencimientos legales para la fecha actual.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group">
           <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:scale-150 transition-all duration-700"></div>
           <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-400 mb-4 flex items-center">
             <AlertTriangle className="w-4 h-4 mr-2" />
             Alerta Preventiva
           </h4>
           <div className="space-y-4">
             {expedientes.filter(e => e.gravedad === 'GRAVISIMA_EXPULSION' && e.etapa === 'NOTIFICADO').map(e => (
               <div key={e.id} className="border-l-2 border-red-500 pl-4 py-1">
                 <p className="text-[10px] font-black uppercase leading-tight">Faltan 48h para Cierre Descargos</p>
                 <p className="text-[9px] text-slate-400 font-bold mt-1">NNA: {e.nnaNombre}</p>
               </div>
             ))}
           </div>
        </div>

        <div className="mt-auto p-6 bg-blue-50 border border-blue-100 rounded-2xl flex items-start space-x-4">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-[9px] text-blue-700 font-medium leading-relaxed uppercase tracking-tighter">
            * Los plazos de 5 días para notificación SIE y 15 días para Reconsideración son fatales. El incumplimiento genera riesgo de multa administrativa.
          </p>
        </div>
      </aside>
    </main>
  );
};

export default CalendarioPlazosLegales;
