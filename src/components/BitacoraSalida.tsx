
import React, { useState } from 'react';
import { DoorOpen, UserCheck, Clock, ShieldAlert, Search, Plus, FileText, X } from 'lucide-react';

const BitacoraSalida: React.FC = () => {
  const [registros, setRegistros] = useState([
    { id: 'S-101', nna: 'A. Rojas B.', hora: '10:45', motivo: 'Suspensión Preventiva', retiradoPor: 'Marta B. (Madre)', rut: '12.345.678-9', firma: true },
    { id: 'S-102', nna: 'M. Soto L.', hora: '12:30', motivo: 'Resolución de Conflicto', retiradoPor: 'Pedro S. (Padre)', rut: '15.678.910-K', firma: true }
  ]);

  return (
    <main className="flex-1 flex flex-col bg-slate-50 overflow-hidden animate-in fade-in duration-700">
      <header className="px-4 md:px-10 py-6 md:py-8 bg-white border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-4 bg-slate-900 text-white rounded-[1.5rem] shadow-xl">
            <DoorOpen className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Control de Salida / Suspensión</h2>
            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Garantía de Resguardo y Custodia - Art. 18 Circular 781</p>
          </div>
        </div>
        <button className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg active:scale-95">
          <Plus className="w-4 h-4" />
          <span>Registrar Retiro Físico</span>
        </button>
      </header>

      <div className="p-4 md:p-10 flex-1 overflow-y-auto space-y-8">
        <section className="bg-amber-50 border-2 border-amber-200 rounded-[2.5rem] p-4 md:p-8 flex items-start space-x-6">
          <ShieldAlert className="w-10 h-10 text-amber-600 shrink-0" />
          <div>
            <h4 className="text-amber-900 font-black text-xs uppercase tracking-widest mb-1">Obligación de Custodia</h4>
            <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
              El establecimiento no puede hacer abandono del estudiante sin antes entregarlo a un adulto responsable, incluso ante medidas de suspensión inmediata. Este registro constituye la prueba legal de entrega de custodia.
            </p>
          </div>
        </section>

        <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
          <div className="md:hidden p-4 space-y-4">
            {registros.map((reg) => (
              <div key={reg.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Folio</p>
                    <p className="text-xs font-black text-slate-800">{reg.id}</p>
                  </div>
                  <span className="text-[10px] font-black text-slate-500">{reg.hora}</span>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Estudiante</p>
                  <p className="text-xs font-black text-slate-800 uppercase">{reg.nna}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Motivo</p>
                  <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-tighter">
                    {reg.motivo}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Adulto Responsable</p>
                    <p className="text-xs font-black text-slate-800 uppercase">{reg.retiradoPor}</p>
                    <p className="text-[9px] font-bold text-slate-400 font-mono">{reg.rut}</p>
                  </div>
                  <button className="p-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all">
                    <FileText className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[860px] text-left">
            <thead>
              <tr className="text-[10px] text-slate-400 uppercase tracking-[0.2em] bg-slate-50/50 border-b border-slate-100">
                <th className="px-4 md:px-10 py-5 font-black">Folio / Hora</th>
                <th className="px-4 md:px-10 py-5 font-black">Estudiante</th>
                <th className="px-4 md:px-10 py-5 font-black">Motivo de Retiro</th>
                <th className="px-4 md:px-10 py-5 font-black">Adulto Responsable (RUT)</th>
                <th className="px-4 md:px-10 py-5 font-black text-center">Acta Salida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {registros.map((reg) => (
                <tr key={reg.id} className="hover:bg-slate-50/80 transition-all">
                  <td className="px-4 md:px-10 py-6">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-800 text-xs">{reg.hora}</span>
                      <span className="font-mono text-[9px] text-blue-500 font-bold">{reg.id}</span>
                    </div>
                  </td>
                  <td className="px-4 md:px-10 py-6">
                    <span className="text-xs font-black text-slate-700 uppercase">{reg.nna}</span>
                  </td>
                  <td className="px-4 md:px-10 py-6">
                    <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-tighter">
                      {reg.motivo}
                    </span>
                  </td>
                  <td className="px-4 md:px-10 py-6">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-800 uppercase">{reg.retiradoPor}</span>
                      <span className="text-[9px] font-bold text-slate-400 font-mono">{reg.rut}</span>
                    </div>
                  </td>
                  <td className="px-4 md:px-10 py-6 text-center">
                    <button className="p-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all">
                      <FileText className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
};

export default BitacoraSalida;
