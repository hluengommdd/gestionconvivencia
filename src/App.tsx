import React, { Suspense, useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import { ConvivenciaProvider, useConvivencia } from './context/ConvivenciaContext';

const ExpedienteDetalle = React.lazy(() => import('./components/ExpedienteDetalle'));
const ExpedienteWizard = React.lazy(() => import('./components/ExpedienteWizard'));
const LegalAssistant = React.lazy(() => import('./components/LegalAssistant'));
const DashboardAuditoriaSIE = React.lazy(() => import('./components/DashboardAuditoriaSIE'));
const CentroMediacionGCC = React.lazy(() => import('./components/CentroMediacionGCC'));
const CalendarioPlazosLegales = React.lazy(() => import('./components/CalendarioPlazosLegales'));
const BitacoraPsicosocial = React.lazy(() => import('./components/BitacoraPsicosocial'));
const GestionEvidencias = React.lazy(() => import('./components/GestionEvidencias'));
const SeguimientoApoyo = React.lazy(() => import('./components/SeguimientoApoyo'));
const ExpedientesList = React.lazy(() => import('./components/ExpedientesList'));
const BitacoraSalida = React.lazy(() => import('./components/BitacoraSalida'));
const ArchivoDocumental = React.lazy(() => import('./components/ArchivoDocumental'));
const ReportePatio = React.lazy(() => import('./components/ReportePatio'));

const LoadingView: React.FC = () => (
  <div className="flex items-center justify-center h-full text-slate-400 text-sm font-semibold">
    Cargando...
  </div>
);

class ErrorBoundary extends React.Component<React.PropsWithChildren, { hasError: boolean }> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('UI ErrorBoundary:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full text-slate-500 text-sm font-semibold">
          Ocurrió un error al cargar esta sección. Intenta recargar la página.
        </div>
      );
    }
    return this.props.children;
  }
}

const MainContent: React.FC = () => {
  const { expedienteSeleccionado, isWizardOpen, currentView } = useConvivencia();

  const renderView = () => {
    if (expedienteSeleccionado) {
      return <ExpedienteDetalle />;
    }

    switch (currentView) {
      case 'EXPEDIENTES':
        return <ExpedientesList />;
      case 'AUDITORIA':
        return <DashboardAuditoriaSIE />;
      case 'GCC':
        return <CentroMediacionGCC />;
      case 'CALENDARIO':
        return <CalendarioPlazosLegales />;
      case 'BITACORA':
        return <BitacoraPsicosocial />;
      case 'EVIDENCIAS':
        return <GestionEvidencias />;
      case 'APOYO':
        return <SeguimientoApoyo />;
      case 'SALIDA':
        return <BitacoraSalida />;
      case 'ARCHIVO':
        return <ArchivoDocumental />;
      case 'REPORTE_PATIO':
        return <ReportePatio />;
      case 'DASHBOARD':
      default:
        return <Dashboard />;
    }
  };

  const getBreadcrumb = () => {
    if (expedienteSeleccionado) return `Expedientes > Detalle ${expedienteSeleccionado.id}`;
    const labels: Record<string, string> = {
      DASHBOARD: 'Dashboard Principal',
      EXPEDIENTES: 'Gestión de Expedientes',
      AUDITORIA: 'Auditoría SIE',
      GCC: 'Mediación GCC',
      CALENDARIO: 'Calendario Normativo',
      BITACORA: 'Bitácora Psicosocial',
      EVIDENCIAS: 'Gestión de Evidencias',
      APOYO: 'Acompañamiento Estudiantil',
      SALIDA: 'Bitácora de Salida',
      ARCHIVO: 'Archivo Sostenedor',
      REPORTE_PATIO: 'Reporte Inicial Patio',
    };
    return labels[currentView] || 'Inicio';
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <header className="min-h-16 md:h-16 bg-white border-b border-slate-200 px-4 md:px-8 py-3 md:py-0 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm z-10 shrink-0">
        <div className="flex items-center flex-wrap gap-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Módulo:</span>
          <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100 uppercase">
            {getBreadcrumb()}
          </span>
        </div>
        <div className="flex items-center flex-wrap gap-3">
          <div className="flex items-center text-[10px] text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 font-bold uppercase tracking-tighter">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
            SYNC STATUS: ONLINE
          </div>
          <div className="hidden md:block h-8 w-[1px] bg-slate-200"></div>
          <span className="text-xs font-black text-slate-600 uppercase tracking-tight">Liceo Bicentenario Excellence</span>
        </div>
      </header>

      <div className="flex-1 relative overflow-hidden bg-slate-50">
        <ErrorBoundary>
          <Suspense fallback={<LoadingView />}>
            {renderView()}
            {isWizardOpen && <ExpedienteWizard />}
            <LegalAssistant />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  return (
    <ConvivenciaProvider>
      {!isOnline && (
        <div className="fixed top-0 inset-x-0 z-50 bg-amber-500 text-slate-900 text-xs font-black text-center py-2">
          Modo offline: algunas funciones pueden no estar disponibles.
        </div>
      )}
      <div className={`flex min-h-screen bg-slate-900 font-sans selection:bg-blue-100 selection:text-blue-700 overflow-hidden ${isOnline ? '' : 'pt-8'}`}>
        <Sidebar />
        <MainContent />
      </div>
    </ConvivenciaProvider>
  );
};

export default App;
