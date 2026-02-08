
import React, { useState, useMemo } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  FileDigit, 
  Heart, 
  Plus, 
  Users, 
  Search, 
  Eye, 
  EyeOff, 
  MoreVertical, 
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  Filter,
  FileText,
  UserCheck
} from 'lucide-react';
import { useConvivencia } from '../context/ConvivenciaContext';
import { useLocalDraft } from '../utils/useLocalDraft';

interface Intervencion {
  id: string;
  nnaId: string;
  nnaNombre: string;
  fecha: string;
  tipo: 'ENTREVISTA' | 'OBSERVACION' | 'VISITA' | 'DERIVACION';
  participantes: string;
  resumen: string;
  privado: boolean;
  autor: string;
}

interface Derivacion {
  id: string;
  nnaNombre: string;
  institucion: 'OPD' | 'COSAM' | 'TRIBUNAL' | 'SALUD';
  fechaEnvio: string;
  estado: 'PENDIENTE' | 'RESPONDIDO';
  numeroOficio: string;
}

const BitacoraPsicosocial: React.FC = () => {
  const { expedientes } = useConvivencia();
  const [isPrivacyBlurred, setIsPrivacyBlurred] = useLocalDraft('bitacora:privacy', true);
  const [searchTerm, setSearchTerm] = useLocalDraft('bitacora:search', '');
  const [activeTab, setActiveTab] = useLocalDraft<'REGISTRO' | 'DERIVACIONES' | 'PROTOCOLOS'>('bitacora:tab', 'REGISTRO');

  // Datos Mock de Intervenciones
  const [intervenciones, setIntervenciones] = useState<Intervencion[]>([
    {
      id: 'INT-001',
      nnaId: 'EXP-2025-001',
      nnaNombre: 'A. Rojas B.',
      fecha: new Date().toISOString().split('T')[0],
      tipo: 'ENTREVISTA',
      participantes: 'NNA, Madre',
      resumen: 'Se observa alta disposición al diálogo. Madre relata dificultades en el entorno familiar pero compromiso con el colegio.',
      privado: true,
      autor: 'Psicóloga Ana'
    },
    {
      id: 'INT-002',
      nnaId: 'EXP-2025-002',
      nnaNombre: 'M. Soto L.',
      fecha: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      tipo: 'OBSERVACION',
      participantes: 'Curso 8°A',
      resumen: 'Durante el recreo se observa aislamiento del NNA respecto al grupo de pares. No hay señales de conflicto activo hoy.',
      privado: false,
      autor: 'Trabajador Social'
    }
  ]);

  const derivaciones: Derivacion[] = [
    { id: 'DER-01', nnaNombre: 'C. Vera P.', institucion: 'OPD', fechaEnvio: '2025-05-01', estado: 'PENDIENTE', numeroOficio: 'OF-123/2025' },
    { id: 'DER-02', nnaNombre: 'D. Lopez M.', institucion: 'COSAM', fechaEnvio: '2025-04-20', estado: 'RESPONDIDO', numeroOficio: 'OF-098/2025' }
  ];

  const filteredIntervenciones = useMemo(() => {
    return intervenciones.filter(i => 
      i.nnaNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.resumen.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [intervenciones, searchTerm]);

  return (
    <main className="flex-1 flex flex-col bg-slate-50 overflow-hidden animate-in fade-in duration-700">
      
      {/* Banner de Sesión Segura */}
      <div className="bg-indigo-900 text-indigo-100 px-4 md:px-8 py-2 flex flex-col md:flex-row items-start md:items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] shrink-0 gap-3">
        <div className="flex items-center space-x-3">
          <Lock className="w-3.5 h-3.5" />
          <span>Sesión Segura: Información Confidencial Protegida (Art. 22 Ley 21.430)</span>
        </div>
        <div className="flex items-center flex-wrap gap-4">
          <div className="flex items-center space-x-1.5 bg-indigo-800 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Dupla Psicosocial Activa</span>
          </div>
          <button 
            onClick={() => setIsPrivacyBlurred(!isPrivacyBlurred)}
            className="flex items-center space-x-2 hover:text-white transition-colors"
          >
            {isPrivacyBlurred ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{isPrivacyBlurred ? 'Mostrar Contenido' : 'Activar Privacidad'}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Navegación Lateral Interna */}
        <aside className="w-full lg:w-72 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 p-4 md:p-8 flex flex-col space-y-6">
          <div className="space-y-1">
             <button 
               onClick={() => setActiveTab('REGISTRO')}
               className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'REGISTRO' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
             >
               <FileDigit className="w-4 h-4" />
               <span>Bitácora Diaria</span>
             </button>
             <button 
               onClick={() => setActiveTab('DERIVACIONES')}
               className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'DERIVACIONES' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
             >
               <ExternalLink className="w-4 h-4" />
               <span>Red de Protección</span>
             </button>
             <button 
               onClick={() => setActiveTab('PROTOCOLOS')}
               className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'PROTOCOLOS' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
             >
               <ShieldCheck className="w-4 h-4" />
               <span>Protocolos Emerg.</span>
             </button>
          </div>

          <div className="pt-6 border-t border-slate-100">
             <button className="w-full flex items-center justify-center space-x-2 py-4 bg-emerald-50 text-emerald-700 border-2 border-emerald-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all active:scale-95 shadow-sm">
                <Plus className="w-4 h-4" />
                <span>Nueva Intervención</span>
             </button>
          </div>

          <div className="mt-auto bg-slate-50 p-6 rounded-3xl border border-slate-100">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Buscador de Casos</h4>
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Nombre NNA..." 
                  className="w-full pl-9 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
             </div>
          </div>
        </aside>

        {/* Área de Contenido Principal */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Listado de Intervenciones */}
          {activeTab === 'REGISTRO' && (
            <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-8 bg-slate-50/30 custom-scrollbar">
              <header className="flex justify-between items-center mb-6">
                 <div>
                   <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tight uppercase">Cronología de Intervenciones</h3>
                   <p className="text-[10px] md:text-xs text-slate-500 font-medium">Registro psicosocial histórico y confidencial.</p>
                 </div>
                 <div className="flex items-center space-x-2">
                    <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600"><Filter className="w-4 h-4" /></button>
                 </div>
              </header>

              <div className="space-y-6">
                {filteredIntervenciones.map((int) => (
                  <div key={int.id} className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/20 p-4 md:p-8 group relative">
                    <div className="flex flex-col md:flex-row items-start md:justify-between mb-4 gap-4">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-2xl ${int.tipo === 'ENTREVISTA' ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'}`}>
                          {int.tipo === 'ENTREVISTA' ? <Users className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                        </div>
                        <div>
                          <div className="flex items-center space-x-3">
                            <h4 className="text-sm font-black text-slate-900 uppercase">{int.nnaNombre}</h4>
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-400 rounded-md text-[8px] font-mono">{int.id}</span>
                            {int.privado && (
                              <span className="flex items-center text-[8px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase">
                                <Lock className="w-3 h-3 mr-1" /> Privado Dupla
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                            {int.tipo} • {int.fecha} • {int.autor}
                          </p>
                        </div>
                      </div>
                      <button className="p-2 text-slate-300 hover:text-slate-600"><MoreVertical className="w-4 h-4" /></button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Participantes</p>
                        <p className="text-xs font-bold text-slate-600">{int.participantes}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Relato de la Intervención</p>
                        <div className={`p-6 bg-slate-50 border border-slate-100 rounded-2xl transition-all duration-500 ${isPrivacyBlurred ? 'blur-md select-none opacity-40' : ''}`}>
                           <p className="text-sm font-medium leading-relaxed text-slate-700">{int.resumen}</p>
                        </div>
                        {isPrivacyBlurred && (
                          <button 
                            onClick={() => setIsPrivacyBlurred(false)}
                            className="absolute inset-x-0 bottom-12 flex justify-center items-center text-[10px] font-black text-indigo-600 uppercase hover:underline"
                          >
                            Haga clic para revelar el contenido sensible
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Panel de Derivaciones */}
          {activeTab === 'DERIVACIONES' && (
            <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-8 animate-in slide-in-from-right-4 duration-500">
              <header>
                <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tight uppercase">Redes de Protección & Derivaciones</h3>
                <p className="text-[10px] md:text-xs text-slate-500 font-medium mt-1">Gestión de oficios y seguimiento de respuestas externas.</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {derivaciones.map((der) => (
                  <div key={der.id} className="bg-white p-4 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center space-x-3">
                           <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                              <ExternalLink className="w-5 h-5" />
                           </div>
                           <div>
                              <p className="text-sm font-black text-slate-900 uppercase">{der.nnaNombre}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enviado a: <span className="text-indigo-600">{der.institucion}</span></p>
                           </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${der.estado === 'RESPONDIDO' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                          {der.estado}
                        </span>
                      </div>
                      
                      <div className="space-y-4">
                         <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <span className="text-[10px] font-black text-slate-400 uppercase">N° Oficio</span>
                            <span className="text-[10px] font-black text-slate-700 font-mono uppercase">{der.numeroOficio}</span>
                         </div>
                         <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <span className="text-[10px] font-black text-slate-400 uppercase">Fecha Envío</span>
                            <span className="text-[10px] font-black text-slate-700 uppercase">{der.fechaEnvio}</span>
                         </div>
                      </div>
                    </div>

                    <button className="mt-8 w-full py-3 bg-white border-2 border-slate-100 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:border-indigo-500 hover:text-indigo-600 transition-all rounded-xl flex items-center justify-center space-x-2">
                       <FileText className="w-4 h-4" />
                       <span>Ver Oficio Adjunto</span>
                    </button>
                  </div>
                ))}

                <button className="bg-indigo-50 border-2 border-indigo-200 border-dashed rounded-[2rem] p-8 flex flex-col items-center justify-center text-center space-y-4 hover:bg-indigo-100 transition-all group">
                   <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-110 transition-transform">
                      <Plus className="w-8 h-8" />
                   </div>
                   <div>
                      <h5 className="text-sm font-black text-indigo-900 uppercase">Registrar Nueva Derivación</h5>
                      <p className="text-[10px] text-indigo-400 font-medium max-w-[200px] mt-1">Inicie el proceso de vinculación con la red externa.</p>
                   </div>
                </button>
              </div>
            </div>
          )}

          {/* Panel de Protocolos de Emergencia */}
          {activeTab === 'PROTOCOLOS' && (
            <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-8 animate-in zoom-in-95 duration-500">
               <header className="bg-red-600 p-4 md:p-8 rounded-[2.5rem] text-white shadow-2xl shadow-red-200 relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                  <div className="relative z-10 flex items-center space-x-6">
                    <div className="p-4 bg-white/20 rounded-[1.5rem] backdrop-blur-md">
                       <AlertCircle className="w-10 h-10" />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black uppercase tracking-tight">Centro de Protocolos de Vulneración</h3>
                       <p className="text-red-100 text-xs font-bold uppercase tracking-widest mt-1">Actuación Inmediata según Circular 781</p>
                    </div>
                  </div>
               </header>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-4 md:p-10 rounded-[2.5rem] border border-red-100 shadow-xl shadow-red-500/5 space-y-6">
                     <h4 className="text-lg font-black text-red-700 tracking-tight uppercase flex items-center">
                        <Heart className="w-5 h-5 mr-3" /> Maltrato / Abuso Sexual
                     </h4>
                     <p className="text-sm font-medium text-slate-500 leading-relaxed">
                        Si existe sospecha fundada de abuso sexual o maltrato físico constitutivo de delito, el establecimiento tiene un plazo de <span className="font-black text-red-600 uppercase">24 horas hábiles</span> para denunciar ante el Ministerio Público, Carabineros o PDI.
                     </p>
                     <ul className="space-y-3">
                        {['Entrevista inicial de acogida (No interrogatorio)', 'Resguardo de la integridad física del NNA', 'Comunicación a Dirección', 'Denuncia Oficial / Notificación SIE'].map((step, idx) => (
                          <li key={idx} className="flex items-center space-x-3 text-[11px] font-bold text-slate-700 uppercase">
                             <span className="w-5 h-5 rounded bg-red-50 text-red-600 flex items-center justify-center text-[10px]">{idx + 1}</span>
                             <span>{step}</span>
                          </li>
                        ))}
                     </ul>
                     <button className="w-full py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 shadow-xl shadow-red-200 active:scale-95 transition-all">
                        Activar Protocolo de Denuncia
                     </button>
                  </div>

                  <div className="bg-white p-4 md:p-10 rounded-[2.5rem] border border-blue-100 shadow-xl shadow-blue-500/5 space-y-6">
                     <h4 className="text-lg font-black text-blue-700 tracking-tight uppercase flex items-center">
                        <UserCheck className="w-5 h-5 mr-3" /> Riesgo Vital / Suicida
                     </h4>
                     <p className="text-sm font-medium text-slate-500 leading-relaxed">
                        En caso de riesgo inminente de daño a sí mismo o terceros, proceda con la derivación inmediata a servicio de urgencia y contacte a los adultos responsables.
                     </p>
                     <ul className="space-y-3">
                        {['Contención emocional primaria', 'Supervisión constante 1:1', 'Derivación a Urgencia Salud Mental', 'Registro en bitácora privada'].map((step, idx) => (
                          <li key={idx} className="flex items-center space-x-3 text-[11px] font-bold text-slate-700 uppercase">
                             <span className="w-5 h-5 rounded bg-blue-50 text-blue-600 flex items-center justify-center text-[10px]">{idx + 1}</span>
                             <span>{step}</span>
                          </li>
                        ))}
                     </ul>
                     <button className="w-full py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-200 active:scale-95 transition-all">
                        Activar Protocolo Salud Mental
                     </button>
                  </div>
               </div>
            </div>
          )}

        </div>

      </div>

    </main>
  );
};

export default BitacoraPsicosocial;
