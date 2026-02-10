import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useConvivencia } from '@/shared/context/ConvivenciaContext';
import { useAuth } from '@/shared/hooks';

/**
 * Mapeo de rutas a etiquetaslegibles
 */
const routeLabels: Record<string, string> = {
  '/': 'Dashboard Principal',
  '/expedientes': 'Gestion de Expedientes',
  '/auditoria': 'Auditoria SIE',
  '/mediacion': 'Mediacion GCC',
  '/calendario': 'Calendario Normativo',
  '/bitacora': 'Bitacora Psicosocial',
  '/evidencias': 'Gestion de Evidencias',
  '/apoyo': 'Acompanamiento Estudiantil',
  '/salida': 'Bitacora de Salida',
  '/archivo': 'Archivo Sostenedor',
  '/patio': 'Reporte Inicial Patio',
};

/**
 * Componente Header refactorizado con useAuth
 */
const Header: React.FC = () => {
  const { expedienteSeleccionado } = useConvivencia();
  const location = useLocation();
  const { session, signIn, signOut } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  /**
   * Genera el breadcrumb actual
   */
  const getBreadcrumb = (): string => {
    if (expedienteSeleccionado) {
      return `Expedientes > Detalle ${expedienteSeleccionado.id}`;
    }
    return routeLabels[location.pathname] || 'Inicio';
  };

  /**
   * Maneja el inicio de sesión
   */
  const handleLogin = async () => {
    setIsLoginLoading(true);
    setLoginError('');
    const { error } = await signIn(email, password);
    if (error) {
      setLoginError('Credenciales inválidas.');
    } else {
      setIsOpen(false);
      setPassword('');
    }
    setIsLoginLoading(false);
  };

  /**
   * Maneja el cierre de sesión
   */
  const handleLogout = async () => {
    await signOut();
    setIsOpen(false);
  };

  return (
    <header className="min-h-16 md:h-16 bg-white border-b border-slate-200 px-4 md:px-8 py-3 md:py-0 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm z-10 shrink-0">
      {/* Breadcrumb */}
      <div className="flex items-center flex-wrap gap-2">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Módulo:</span>
        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100 uppercase">
          {getBreadcrumb()}
        </span>
      </div>

      {/* Acciones */}
      <div className="flex items-center flex-wrap gap-3">
        <div className="flex items-center text-[10px] text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 font-bold uppercase tracking-tighter">
          <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
          Sync Status: Online
        </div>
        <div className="hidden md:block h-8 w-[1px] bg-slate-200"></div>
        <span className="text-xs font-black text-slate-600 uppercase tracking-tight">Liceo Bicentenario Excellence</span>

        {/* Auth */}
        <div className="relative">
          {session ? (
            <button
              onClick={handleLogout}
              className="text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white px-3 py-2 rounded-lg"
            >
              Cerrar sesión
            </button>
          ) : (
            <button
              onClick={() => setIsOpen((v) => !v)}
              className="text-[10px] font-black uppercase tracking-widest bg-blue-600 text-white px-3 py-2 rounded-lg"
            >
              Iniciar sesión
            </button>
          )}

          {/* Login form */}
          {!session && isOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg p-3 z-20">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                placeholder="email@dominio.cl"
              />
              <label className="mt-3 block text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                placeholder="********"
              />
              {loginError && (
                <p className="mt-2 text-[10px] font-bold text-red-500">{loginError}</p>
              )}
              <button
                onClick={handleLogin}
                disabled={isLoginLoading}
                className={`mt-3 w-full px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest ${isLoginLoading ? 'bg-slate-200 text-slate-400' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                {isLoginLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
