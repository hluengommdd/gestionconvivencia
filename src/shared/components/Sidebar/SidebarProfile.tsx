import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp, User, Lock, LogOut, Loader2 } from 'lucide-react';
import { supabase } from '@/shared/lib/supabaseClient';

/** Perfil de usuario cargado desde Supabase */
interface UserProfile {
  nombre: string | null;
  rol: string | null;
  establecimiento_id: string | null;
}

/** Props para SidebarProfile */
interface SidebarProfileProps {
  isCollapsed: boolean;
}

/**
 * Componente de perfil del Sidebar.
 * Maneja información del usuario, menú desplegable y cambio de contraseña.
 */
export const SidebarProfile: React.FC<SidebarProfileProps> = ({ isCollapsed }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [pwStatus, setPwStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [isUpdatingPw, setIsUpdatingPw] = useState(false);

  // Obtener usuario actual
  const getSession = useCallback(async () => {
    if (!supabase) return null;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch {
      console.error('[SidebarProfile] Error obteniendo sesión');
      return null;
    }
  }, []);

  // Cargar perfil del usuario con memoización
  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      const session = await getSession();
      
      if (!session?.user?.id || !supabase) {
        setProfile(null);
        setIsLoading(false);
        return;
      }

      try {
        const { data: perfil, error } = await supabase
          .from('perfiles')
          .select('nombre, rol, establecimiento_id')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.warn('[SidebarProfile] Error cargando perfil, usando fallback:', error.message);
        }

        setProfile({
          nombre: perfil?.nombre || session.user.email?.split('@')[0] || 'Usuario',
          rol: perfil?.rol || 'sostenedor',
          establecimiento_id: perfil?.establecimiento_id || null,
        });
      } catch (err) {
        console.error('[SidebarProfile] Error inesperado:', err);
        setProfile({
          nombre: session.user.email?.split('@')[0] || 'Usuario',
          rol: 'sostenedor',
          establecimiento_id: null,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [getSession]);

  // Cerrar sesión
  const handleSignOut = useCallback(async () => {
    if (!supabase) return;
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('[SidebarProfile] Error cerrando sesión:', err);
    }
  }, []);

  // Manejar cambio de contraseña con debounce
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword.trim()) {
      setPwStatus({ type: 'error', message: 'Ingresa una contraseña.' });
      return;
    }
    if (newPassword.length < 6) {
      setPwStatus({ type: 'error', message: 'Mínimo 6 caracteres.' });
      return;
    }

    setIsUpdatingPw(true);
    setPwStatus(null);

    try {
      const { error } = await supabase!.auth.updateUser({ password: newPassword });
      
      if (error) {
        setPwStatus({ type: 'error', message: `Error: ${error.message}` });
      } else {
        setPwStatus({ type: 'success', message: '¡Contraseña actualizada!' });
        setNewPassword('');
      }
    } catch (err) {
      setPwStatus({ type: 'error', message: 'Error al actualizar contraseña.' });
    } finally {
      setIsUpdatingPw(false);
    }
  };

  // Modo colapsado - solo botón de logout
  if (isCollapsed) {
    return (
      <div className="p-3 border-t border-slate-700">
        <button
          onClick={handleSignOut}
          className="w-full flex justify-center p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          title="Cerrar sesión"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // Modo expandido
  return (
    <div className="border-t border-slate-700 p-4">
      {/* Perfil */}
      <div className="relative">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 transition-colors"
          aria-expanded={isMenuOpen}
          aria-haspopup="true"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg">
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : (
              <User className="w-5 h-5 text-white" />
            )}
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {isLoading ? 'Cargando...' : profile?.nombre || 'Usuario'}
            </p>
            <p className="text-xs text-slate-400 capitalize">
              {profile?.rol || 'sostenedor'}
            </p>
          </div>
          {isMenuOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {/* Menú desplegable con transición */}
        {isMenuOpen && (
          <div 
            className="absolute bottom-full left-0 right-0 mb-2 bg-slate-800 rounded-lg shadow-xl border border-slate-700 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200"
            role="menu"
          >
            {/* Cambio de contraseña */}
            <div className="p-3 border-b border-slate-700">
              <div className="flex items-center gap-2 mb-2 text-slate-300">
                <Lock className="w-4 h-4" />
                <span className="text-xs font-medium">Cambiar Contraseña</span>
              </div>
              <form onSubmit={handlePasswordChange} className="space-y-2">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nueva contraseña"
                  aria-label="Nueva contraseña"
                  className="w-full px-3 py-1.5 text-sm bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={isUpdatingPw}
                  className="w-full px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isUpdatingPw ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    'Actualizar'
                  )}
                </button>
                {pwStatus && (
                  <p className={`text-xs ${
                    pwStatus.type === 'error' ? 'text-red-400' : 
                    pwStatus.type === 'success' ? 'text-green-400' : 'text-blue-400'
                  }`}>
                    {pwStatus.message}
                  </p>
                )}
              </form>
            </div>

            {/* Cerrar sesión */}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-slate-700 transition-colors"
              role="menuitem"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarProfile;
