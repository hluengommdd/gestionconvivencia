import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  Calendar,
  Heart,
  Image as ImageIcon,
  HeartHandshake,
  Library,
  ClipboardList,
  FileStack,
  ChevronDown,
  Hand
} from 'lucide-react';

/** Categorías de navegación para mejor coherencia */
type NavCategory = 'PRINCIPAL' | 'REGISTRO' | 'GESTION' | 'ADMIN';

/** Elemento de navegación con submenú expandable */
interface ExpandableItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  category: NavCategory;
  defaultOpen?: boolean;
  submenu: {
    name: string;
    path: string;
    action?: 'modal';
  }[];
}

/** Elemento de navegación estándar */
interface NavItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  category: NavCategory;
  description?: string;
}

/** Elementos de navegación con submenús expandibles */
const expandableItems: ExpandableItem[] = [
  {
    name: 'Reportes Patio',
    icon: ClipboardList,
    category: 'REGISTRO',
    defaultOpen: false,
    submenu: [
      { name: 'Ver Reportes', path: '/patio/lista' },
      { name: 'Nuevo Reporte', path: '/patio', action: 'modal' }
    ]
  },
  {
    name: 'Bitácora Psicosocial',
    icon: Heart,
    category: 'REGISTRO',
    defaultOpen: false,
    submenu: [
      { name: 'Ver Bitácora', path: '/bitacora' },
      { name: 'Nueva Intervención', path: '/bitacora/intervencion', action: 'modal' },
      { name: 'Registrar Derivación', path: '/bitacora/derivacion', action: 'modal' }
    ]
  }
];

/** Elementos de navegación estándar */
const menuItems: NavItem[] = [
  // Principal
  { name: 'Dashboard', icon: LayoutDashboard, path: '/', category: 'PRINCIPAL' },
  
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
 * Maneja elementos de menú con agrupamiento por categoría y submenús expandibles.
 */
export const SidebarNav: React.FC<SidebarNavProps> = ({ isCollapsed }) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleExpand = (name: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

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

  // Obtener items expandibles por categoría
  const groupedExpandable = expandableItems.reduce<Record<NavCategory, ExpandableItem[]>>((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<NavCategory, ExpandableItem[]>);

  return (
    <nav className="flex-1 overflow-y-auto py-4" aria-label="Navegación principal">
      <ul className="space-y-1 px-3">
        {categoryOrder.map((category) => {
          const expandableInCategory = groupedExpandable[category] || [];
          const itemsInCategory = groupedItems[category] || [];
          
          return (
            <React.Fragment key={category}>
              {/* Header de categoría - solo visible si no está colapsado */}
              {!isCollapsed && (expandableInCategory.length > 0 || itemsInCategory.length > 0) && (
                <li className="pt-4 pb-2 first:pt-0">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-3">
                    {getCategoryLabel(category)}
                  </span>
                </li>
              )}
              
              {/* Items expandibles */}
              {expandableInCategory.map((item) => {
                const Icon = item.icon;
                const isExpanded = expandedItems[item.name];
                const pathname = location.pathname;
                const isItemActive = item.submenu.some(sub => pathname === sub.path);
                const submenuId = `submenu-${item.name.replace(/\s+/g, '-')}`;
                
                return (
                  <li key={item.name}>
                    {/* Botón principal expandible */}
                    <button
                      onClick={() => toggleExpand(item.name)}
                      aria-expanded={isExpanded}
                      aria-controls={submenuId}
                      className={`w-full group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                        isItemActive || isExpanded
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <Icon className={`w-5 h-5 flex-shrink-0 transition-transform ${isItemActive || isExpanded ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                      {!isCollapsed && (
                        <>
                          <div className="flex flex-col flex-1 text-left">
                            <span className="text-sm font-medium">{item.name}</span>
                          </div>
                          <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} aria-hidden="true" />
                        </>
                      )}
                    </button>
                    
                    {/* Submenú */}
                    {!isCollapsed && isExpanded && (
                      <ul id={submenuId} className="ml-4 mt-1 space-y-1 border-l-2 border-slate-700 pl-3" role="list">
                        {item.submenu.map((sub) => {
                          const pathname = location.pathname;
                          const isSubActive = pathname === sub.path;
                          
                          return (
                            <li key={sub.path}>
                              <NavLink
                                to={sub.path}
                                aria-label={sub.name}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-xs ${
                                  isSubActive
                                    ? 'bg-blue-500/20 text-blue-400 font-medium'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                }`}
                              >
                                {sub.action === 'modal' && <Hand className="w-4 h-4" aria-hidden="true" />}
                                <span>{sub.name}</span>
                              </NavLink>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
              
              {/* Items estándar de la categoría */}
              {itemsInCategory.map((item) => {
                const Icon = item.icon;
                const pathname = location.pathname;
                const isSubPath = pathname.startsWith(item.path + '/');
                const isExactMatch = pathname === item.path;
                const isActive = isExactMatch || isSubPath;
                
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      aria-label={item.name}
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
          );
        })}
      </ul>
    </nav>
  );
};

export default SidebarNav;
