/**
 * useAuth - Hook de Autenticación y Roles
 * Maneja la sesión del usuario y los permisos según el rol
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/shared/lib/supabaseClient';

// ============ TIPOS ============

export type RolUsuario = 
  | 'DIRECTOR'
  | 'INSPECTOR_GENERAL'
  | 'CONVIVENCIA_ESCOLAR'
  | 'PSICOLOGO'
  | 'PSICOPEDAGOGO'
  | 'PROFESOR_JEFE'
  | 'ADMINISTRADOR'
  | 'SECRETARIA';

export type Permiso =
  | 'expedientes:crear'
  | 'expedientes:leer'
  | 'expedientes:editar'
  | 'expedientes:eliminar'
  | 'expedientes:archivar'
  | 'expedientes:asignar'
  | 'documentos:subir'
  | 'documentos:eliminar'
  | 'reportes:generar'
  | 'reportes:exportar'
  | 'usuarios:gestionar'
  | 'configuracion:editar'
  | 'bitacora:ver'
  | 'bitacora:exportar';

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: RolUsuario;
  permisos: Permiso[];
  establecimientoId: string;
}

// ============ MATRIZ DE PERMISOS ============

const MATRIZ_PERMISOS: Record<RolUsuario, Permiso[]> = {
  DIRECTOR: [
    'expedientes:crear', 'expedientes:leer', 'expedientes:editar', 'expedientes:archivar', 'expedientes:asignar',
    'documentos:subir', 'documentos:eliminar',
    'reportes:generar', 'reportes:exportar',
    'usuarios:gestionar', 'configuracion:editar',
    'bitacora:ver', 'bitacora:exportar'
  ],
  INSPECTOR_GENERAL: [
    'expedientes:crear', 'expedientes:leer', 'expedientes:editar', 'expedientes:archivar', 'expedientes:asignar',
    'documentos:subir', 'documentos:eliminar',
    'reportes:generar', 'reportes:exportar',
    'bitacora:ver', 'bitacora:exportar'
  ],
  CONVIVENCIA_ESCOLAR: [
    'expedientes:crear', 'expedientes:leer', 'expedientes:editar', 'expedientes:archivar', 'expedientes:asignar',
    'documentos:subir', 'documentos:eliminar',
    'reportes:generar', 'reportes:exportar',
    'bitacora:ver', 'bitacora:exportar'
  ],
  PSICOLOGO: [
    'expedientes:leer',
    'documentos:subir',
    'reportes:generar',
    'bitacora:ver'
  ],
  PSICOPEDAGOGO: [
    'expedientes:leer',
    'documentos:subir',
    'reportes:generar',
    'bitacora:ver'
  ],
  PROFESOR_JEFE: [
    'expedientes:leer',
    'documentos:subir',
    'reportes:generar'
  ],
  ADMINISTRADOR: [
    'expedientes:crear', 'expedientes:leer', 'expedientes:editar', 'expedientes:eliminar', 'expedientes:archivar', 'expedientes:asignar',
    'documentos:subir', 'documentos:eliminar',
    'reportes:generar', 'reportes:exportar',
    'usuarios:gestionar', 'configuracion:editar',
    'bitacora:ver', 'bitacora:exportar'
  ],
  SECRETARIA: [
    'expedientes:crear', 'expedientes:leer',
    'documentos:subir',
    'reportes:generar'
  ]
};

// ============ CONTEXT - Compatible con uso existente ============

interface AuthContextType {
  session: { user: { id: string; email?: string } } | null;
  user: { id: string; email?: string } | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  usuario: Usuario | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  tienePermiso: (permiso: Permiso) => boolean;
  tieneAlgunPermiso: (permisos: Permiso[]) => boolean;
  tieneTodosLosPermisos: (permisos: Permiso[]) => boolean;
  puedeAccederExpediente: (expediente: { responsableId?: string; establecimientoId?: string }) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<{ user: { id: string; email?: string } } | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    const verificarSesion = async () => {
      const { data } = await (supabase as NonNullable<typeof supabase>).auth.getSession();
      setSession(data.session);
      
      if (data.session?.user) {
        const usuarioDemo: Usuario = {
          id: data.session.user.id,
          email: data.session.user.email || '',
          nombre: 'Usuario',
          apellido: 'Demo',
          rol: 'CONVIVENCIA_ESCOLAR',
          permisos: MATRIZ_PERMISOS['CONVIVENCIA_ESCOLAR'],
          establecimientoId: 'demo-establecimiento'
        };
        setUsuario(usuarioDemo);
      }
      setIsLoading(false);
    };

    verificarSesion();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        const usuarioDemo: Usuario = {
          id: session.user.id,
          email: session.user.email || '',
          nombre: 'Usuario',
          apellido: 'Demo',
          rol: 'CONVIVENCIA_ESCOLAR',
          permisos: MATRIZ_PERMISOS['CONVIVENCIA_ESCOLAR'],
          establecimientoId: 'demo-establecimiento'
        };
        setUsuario(usuarioDemo);
      } else {
        setUsuario(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
    if (!supabase) {
      return { error: new Error('Supabase no configurado') };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        return { error: new Error(error.message) };
      }

      setSession(data.session);

      if (data.user) {
        const usuarioDemo: Usuario = {
          id: data.user.id,
          email: data.user.email || email,
          nombre: 'Usuario',
          apellido: 'Demo',
          rol: 'CONVIVENCIA_ESCOLAR',
          permisos: MATRIZ_PERMISOS['CONVIVENCIA_ESCOLAR'],
          establecimientoId: 'demo-establecimiento'
        };
        setUsuario(usuarioDemo);
      }

      return { error: null };
    } catch (err) {
      return { error: new Error('Error al iniciar sesión') };
    }
  };

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setSession(null);
    setUsuario(null);
  };

  const updatePassword = async (newPassword: string): Promise<void> => {
    if (!supabase) {
      throw new Error('Supabase no configurado');
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      throw new Error(error.message);
    }
  };

  const tienePermiso = (permiso: Permiso): boolean => {
    return usuario?.permisos.includes(permiso) ?? false;
  };

  const tieneAlgunPermiso = (permisos: Permiso[]): boolean => {
    return permisos.some(p => usuario?.permisos.includes(p)) ?? false;
  };

  const tieneTodosLosPermisos = (permisos: Permiso[]): boolean => {
    return permisos.every(p => usuario?.permisos.includes(p)) ?? false;
  };

  const puedeAccederExpediente = (expediente: { responsableId?: string; establecimientoId?: string }): boolean => {
    if (!usuario) return false;
    
    if (['ADMINISTRADOR', 'DIRECTOR'].includes(usuario.rol)) {
      return true;
    }

    return expediente.establecimientoId === usuario.establecimientoId;
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        signIn,
        signOut,
        updatePassword,
        usuario,
        isLoading,
        isAuthenticated: !!session,
        tienePermiso,
        tieneAlgunPermiso,
        tieneTodosLosPermisos,
        puedeAccederExpediente
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}

export function tieneRol(roles: RolUsuario[]): (usuario: Usuario | null) => boolean {
  return (usuario: Usuario | null) => usuario ? roles.includes(usuario.rol) : false;
}

export function esAdministrador(usuario: Usuario | null): boolean {
  return usuario ? ['ADMINISTRADOR', 'DIRECTOR', 'INSPECTOR_GENERAL'].includes(usuario.rol) : false;
}

export function esEquipoConvivencia(usuario: Usuario | null): boolean {
  return usuario ? ['CONVIVENCIA_ESCOLAR', 'INSPECTOR_GENERAL', 'DIRECTOR'].includes(usuario.rol) : false;
}

export default useAuth;
