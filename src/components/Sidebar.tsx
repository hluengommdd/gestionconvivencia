import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  Users,
  ShieldAlert,
  History,
  Settings,
  ChevronRight,
  Calendar,
  Heart,
  Image as ImageIcon,
  HeartHandshake,
  Database,
  DoorOpen,
  Library,
  AlertOctagon,
  Menu,
  X,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { useConvivencia, AppView } from '../context/ConvivenciaContext';

const menuItems: { name: string; icon: any; view: AppView }[] = [
  { name: 'Dashboard', icon: LayoutDashboard, view: 'DASHBOARD' },
  { name: 'Reporte Patio', icon: AlertOctagon, view: 'REPORTE_PATIO' },
  { name: 'Expedientes', icon: Database, view: 'EXPEDIENTES' },
  { name: 'Calendario', icon: Calendar, view: 'CALENDARIO' },
  { name: 'Acompañamiento', icon: HeartHandshake, view: 'APOYO' },
  { name: 'Evidencias', icon: ImageIcon, view: 'EVIDENCIAS' },
  { name: 'Bitácora Psicosocial', icon: Heart, view: 'BITACORA' },
  { name: 'Bitácora de Salida', icon: DoorOpen, view: 'SALIDA' },
  { name: 'Mediación GCC', icon: Users, view: 'GCC' },
  { name: 'Archivo Sostenedor', icon: Library, view: 'ARCHIVO' },
  { name: 'Auditoría SIE', icon: ShieldAlert, view: 'AUDITORIA' },
];

const Sidebar: React.FC = () => {
  const { currentView, setCurrentView, setExpedienteSeleccionado } = useConvivencia();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem('sidebar:collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const handleNav = (view: AppView) => {
    setExpedienteSeleccionado(null);
    setCurrentView(view);
    setIsOpen(false);
  };

  useEffect(() => {
    try {
      localStorage.setItem('sidebar:collapsed', String(isCollapsed));
    } catch {
      // ignore
    }
  }, [isCollapsed]);

  return (
    <>
      <div className="md:hidden sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-2">
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-black leading-none tracking-tight italic">SGE <span className="text-blue-400">782</span></h1>
            <p className="text-[9px] text-slate-500 uppercase font-black mt-1">Gestión Normativa</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-lg bg-slate-800 border border-slate-700"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`fixed md:static top-0 left-0 h-screen w-72 ${isCollapsed ? 'md:w-20' : 'md:w-64'} bg-slate-900 text-white flex flex-col border-r border-slate-800 shadow-xl z-50 shrink-0 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className={`p-6 flex items-center justify-between space-x-3 border-b border-slate-700 pb-4 ${isCollapsed ? 'md:justify-center' : ''}`}>
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20 cursor-pointer hover:scale-105 transition-transform" onClick={() => handleNav('DASHBOARD')}>
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div className={`${isCollapsed ? 'md:hidden' : ''}`}>
              <h1 className="text-xl font-black leading-none tracking-tight italic">SGE <span className="text-blue-400">782</span></h1>
              <p className="text-[10px] text-slate-500 uppercase font-black mt-1">Gestión Normativa</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden p-2 rounded-lg bg-slate-800 border border-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsCollapsed(v => !v)}
            className="hidden md:flex p-2 rounded-lg bg-slate-800 border border-slate-700"
            title={isCollapsed ? 'Expandir' : 'Contraer'}
          >
            {isCollapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
          </button>
        </div>

        <nav className={`flex-1 mt-6 px-4 space-y-1 overflow-y-auto no-scrollbar ${isCollapsed ? 'md:px-3' : ''}`}>
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleNav(item.view)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group ${
                currentView === item.view
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className={`${currentView === item.view ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`}>
                  {React.createElement(item.icon, { size: 16 })}
                </span>
                <span className={`text-[10px] font-black uppercase tracking-wider ${isCollapsed ? 'md:hidden' : ''}`}>{item.name}</span>
              </div>
            </button>
          ))}
        </nav>

        <div className={`p-6 mt-auto border-t border-slate-800 bg-slate-900/50 ${isCollapsed ? 'md:px-3' : ''}`}>
          <div className={`flex items-center space-x-3 p-3 rounded-2xl hover:bg-slate-800 transition-colors cursor-pointer group border border-transparent hover:border-slate-700 ${isCollapsed ? 'md:justify-center md:px-0' : ''}`}>
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-black text-blue-400 group-hover:border-blue-500 transition-colors">
              JD
            </div>
            <div className={`flex-1 overflow-hidden ${isCollapsed ? 'md:hidden' : ''}`}>
              <p className="text-[10px] font-black text-white truncate uppercase tracking-tighter">Juan Director</p>
              <p className="text-[9px] text-slate-500 truncate font-bold uppercase">Admin SIE</p>
            </div>
            <Settings className={`w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors ${isCollapsed ? 'md:hidden' : ''}`} />
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
