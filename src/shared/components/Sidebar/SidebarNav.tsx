import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  Calendar,
  Heart,
  Image as ImageIcon,
  HeartHandshake,
  DoorOpen,
  Library,
  ClipboardList,
  PlusCircle,
  FileStack
} from 'lucide-react';

/** Categorías de navegación para mejor coherencia */
type NavCategory = 'PRINCIPAL' | 'REGISTRO' | 'GESTION' | 'ADMIN';

/** Elemento de navegación con categoría */
interface NavItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  category: NavCategory;
  description?: string;
}

/** Elementos de navegación del menú - organizados por categoría lógica */
const menuItems: NavItem[] = [
  // Principal
  { name: 'Dashboard', icon: LayoutDashboard, path: '/', category: 'PRINCIPAL' },
  
  // Registro y Control de Incidentes
  { name: 'Registros Patio', icon: ClipboardList, path: '/patio/lista', category: 'REGISTRO', description: 'Ver reportes de patio' },
  { name: 'Nuevo Reporte', icon: PlusCircle, path: '/patio', category: 'REGISTRO', description: 'Crear reporte de incidente' },
  { name: 'Bitácora Psicosocial', icon: Heart, path: '/bitacora', category: 'REGISTRO' },
  { name: 'Bitácora de Salida', icon: DoorOpen, path: '/salida', category: 'REGISTRO' },
  
  // Gestión Formal
  { name: 'Expedientes', icon: FileStack, path: '/expedientes', category: 'GESTION' },
  { name: 'Evidencias', icon: ImageIcon, path: '/evidencias', category: 'GESTION' },
  { name: 'Mediación GCC', icon: Users, path: '/mediacion', category: 'GESTION' },
  
  // Administración y Herramientas
  { name: 'Calendario', icon: Calendar, path: '/calendario', category: 'ADMIN' },
  { name: 'Acompañamiento', icon: HeartHandshake, path: '/apoyo', category: 'ADMIN' },
  { name: 'Archivo Sostenedor', icon: Library, path: '/archivo', category: 'ADMIN' },
  { name: 'Auditoría SIE', icon: ShieldAlert, path: '/auditoria', category: 'ADMIN' },
];

/** Obtener label de categoría para display */
const getCategoryLabel = (category: NavCategory): string => {
  const labels: Record<NavCategory, string> = {
    PRINCIPAL: 'Principal',
    REGISTRO: 'Registro e Incidentes',
    GESTION: 'Gestión Formal',
    ADMIN: 'Administración',
  };
  return labels[category];
};

/** Props para SidebarNav */
interface SidebarNavProps {
  isCollapsed: boolean;
}

/**
 * Componente de navegación del Sidebar.
 * Maneja elementos de menú con agrupamiento por categoría.
 */
export const SidebarNav: React.FC<SidebarNavProps> = ({ isCollapsed }) => {
  const location = useLocation();

  // Agrupar items por categoría
  const groupedItems = menuItems.reduce<Record<NavCategory, NavItem[]>>((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<NavCategory, NavItem[]>);

  // Orden de categorías para display
  const categoryOrder: NavCategory[] = ['PRINCIPAL', 'REGISTRO', 'GESTION', 'ADMIN'];

  return (
    <nav className="flex-1 overflow-y-auto py-4">
      <ul className="space-y-1 px-3">
        {categoryOrder.map((category) => (
          <React.Fragment key={category}>
            {/* Header de categoría - solo visible si no está colapsado */}
            {!isCollapsed && (
              <li className="pt-4 pb-2 first:pt-0">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-3">
                  {getCategoryLabel(category)}
                </span>
              </li>
            )}
            
            {/* Items de la categoría */}
            {groupedItems[category]?.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || 
                (item.path !== '/' && location.pathname.startsWith(item.path));
              
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                    {!isCollapsed && (
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{item.name}</span>
                        {item.description && (
                          <span className="text-[10px] text-slate-400 group-hover:text-slate-300">
                            {item.description}
                          </span>
                        )}
                      </div>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </React.Fragment>
        ))}
      </ul>
    </nav>
  );
};

export default SidebarNav;
