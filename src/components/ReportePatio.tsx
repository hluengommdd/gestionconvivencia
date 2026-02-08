
import React, { useState } from 'react';
import { AlertCircle, User, Clock, MapPin, Send, ShieldAlert, CheckCircle } from 'lucide-react';

const ReportePatio: React.FC = () => {
  const [enviado, setEnviado] = useState(false);
  const [formData, setFormData] = useState({
    informante: '',
    estudiante: '',
    lugar: '',
    descripcion: '',
    gravedadPercibida: 'LEVE'
  });

  const handleEnviar = (e: React.FormEvent) => {
    e.preventDefault();
    setEnviado(true);
    setTimeout(() => setEnviado(false), 3000);
  };

  return (
    <main className="flex-1 p-10 bg-slate-50 flex justify-center items-center overflow-y-auto animate-in fade-in duration-700">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] border border-slate-200 shadow-2xl p-12 space-y-8">
        <header className="text-center space-y-2">
          <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-[2rem] flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Reporte de Incidente en Patio</h2>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Entrada Rápida - Vigilancia y Convivencia</p>
        </header>

        {enviado ? (
          <div className="py-12 text-center space-y-4 animate-in zoom-in-95">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto" />
            <h3 className="text-xl font-black text-slate-900">REPORTE ENVIADO</h3>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">El encargado de convivencia ha sido notificado para la apertura de folio.</p>
          </div>
        ) : (
          <form onSubmit={handleEnviar} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                  <User className="w-3 h-3 mr-2" /> Informante (Nombre/Cargo)
                </label>
                <input 
                  required
                  type="text" 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-amber-500/5 focus:outline-none"
                  value={formData.informante}
                  onChange={e => setFormData({...formData, informante: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                  <MapPin className="w-3 h-3 mr-2" /> Lugar del Evento
                </label>
                <select 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none"
                  value={formData.lugar}
                  onChange={e => setFormData({...formData, lugar: e.target.value})}
                >
                  <option value="">Seleccione lugar...</option>
                  <option value="PATIO">Patio Central</option>
                  <option value="SALA">Sala de Clases</option>
                  <option value="BANO">Baños</option>
                  <option value="COMEDOR">Casino/Comedor</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                <ShieldAlert className="w-3 h-3 mr-2" /> Gravedad Observada
              </label>
              <div className="flex gap-4">
                {['LEVE', 'RELEVANTE', 'GRAVE'].map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setFormData({...formData, gravedadPercibida: g})}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                      formData.gravedadPercibida === g ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-slate-400 border-slate-100'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                Narración de los Hechos
              </label>
              <textarea 
                required
                className="w-full h-32 px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none resize-none"
                placeholder="Describa brevemente lo sucedido..."
                value={formData.descripcion}
                onChange={e => setFormData({...formData, descripcion: e.target.value})}
              />
            </div>

            <button 
              type="submit"
              className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-slate-800 transition-all flex items-center justify-center space-x-3 active:scale-95"
            >
              <Send className="w-5 h-5" />
              <span>Enviar a Convivencia</span>
            </button>
          </form>
        )}
      </div>
    </main>
  );
};

export default ReportePatio;
