
import React from 'react';
import { Library, Folder, FileText, Download, ShieldCheck, Search, Filter } from 'lucide-react';

const ArchivoDocumental: React.FC = () => {
  const carpetas = [
    { name: 'Reglamentos RICE 2025', docs: 4, size: '12 MB' },
    { name: 'Protocolos de Emergencia', docs: 8, size: '24 MB' },
    { name: 'Resoluciones Firmadas', docs: 42, size: '156 MB' },
    { name: 'Actas de Mediación', docs: 15, size: '8 MB' }
  ];

  return (
    <main className="flex-1 flex flex-col bg-slate-50 overflow-hidden animate-in fade-in duration-700">
      <header className="px-4 md:px-10 py-6 md:py-8 bg-white border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-4 bg-blue-600 text-white rounded-[1.5rem] shadow-xl">
            <Library className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Portal de Documentación Institucional</h2>
            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Repositorio Central de Gestión Normativa</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-[10px] font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 uppercase tracking-widest">
          <ShieldCheck className="w-4 h-4" />
          <span>Archivo Auditado SIE</span>
        </div>
      </header>

      <div className="p-4 md:p-10 flex-1 overflow-y-auto space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {carpetas.map((folder) => (
            <div key={folder.name} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all group cursor-pointer border-b-4 border-b-blue-600/10">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Folder className="w-7 h-7" />
              </div>
              <h3 className="text-xs font-black text-slate-800 uppercase mb-2 tracking-tight leading-tight">{folder.name}</h3>
              <div className="flex justify-between items-center mt-auto">
                <span className="text-[10px] font-bold text-slate-400 uppercase">{folder.docs} Documentos</span>
                <span className="text-[9px] font-mono text-slate-300">{folder.size}</span>
              </div>
            </div>
          ))}
        </div>

        <section className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 md:p-8 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h3 className="font-black text-slate-800 text-sm tracking-tight uppercase">Documentos Recientes</h3>
            <div className="flex items-center space-x-4 w-full md:w-auto">
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                <input type="text" placeholder="Filtrar documentos..." className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold focus:outline-none w-full md:w-auto" />
              </div>
              <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Download className="w-4 h-4" /></button>
            </div>
          </div>
          
          <div className="divide-y divide-slate-50">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="px-4 md:px-10 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-slate-100 text-slate-400 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-slate-700 uppercase">Resolución_Exenta_EXP-2025-00{i}.pdf</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Firmado: 12 Mayo 2025 • 2.4 MB</p>
                  </div>
                </div>
                <button className="p-2 bg-slate-50 text-slate-300 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};

export default ArchivoDocumental;
