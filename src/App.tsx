import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConvivenciaProvider, useConvivencia } from '@/shared/context/ConvivenciaContext';
import Layout from '@/shared/components/Layout';
import ErrorBoundary from '@/shared/components/ErrorBoundary';

// Feature Components
const Dashboard = React.lazy(() => import('@/features/dashboard/Dashboard'));
const ExpedientesList = React.lazy(() => import('@/features/expedientes/ExpedientesList'));
const ExpedienteDetalle = React.lazy(() => import('@/features/expedientes/ExpedienteDetalle'));
const ExpedienteWizard = React.lazy(() => import('@/features/expedientes/ExpedienteWizard'));
const DashboardAuditoriaSIE = React.lazy(() => import('@/features/dashboard/DashboardAuditoriaSIE'));
const CentroMediacionGCC = React.lazy(() => import('@/features/mediacion/CentroMediacionGCC'));
const CalendarioPlazosLegales = React.lazy(() => import('@/features/legal/CalendarioPlazosLegales'));
const BitacoraPsicosocial = React.lazy(() => import('@/features/bitacora/BitacoraPsicosocial'));
const GestionEvidencias = React.lazy(() => import('@/features/evidencias/GestionEvidencias'));
const SeguimientoApoyo = React.lazy(() => import('@/features/apoyo/SeguimientoApoyo'));
const BitacoraSalida = React.lazy(() => import('@/features/bitacora/BitacoraSalida'));
const ArchivoDocumental = React.lazy(() => import('@/features/archivo/ArchivoDocumental'));
const ReportePatio = React.lazy(() => import('@/features/patio/ReportePatio'));
const ListaReportesPatio = React.lazy(() => import('@/features/patio/ListaReportesPatio'));
const LegalAssistant = React.lazy(() => import('@/features/legal/LegalAssistant'));
const PerfilUsuario = React.lazy(() => import('@/features/perfil/PerfilUsuario'));

const LoadingView: React.FC = () => (
  <div className="flex items-center justify-center h-full text-slate-400 text-sm font-semibold">
    Cargando...
  </div>
);

// Error Boundary moved to shared/components/ErrorBoundary.tsx

// Wrapper for suspended routes
const SuspendedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ErrorBoundary>
    <Suspense fallback={<LoadingView />}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

const AppRoutes: React.FC = () => {
  const { isWizardOpen } = useConvivencia();

  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<SuspendedRoute><Dashboard /></SuspendedRoute>} />
          <Route path="expedientes" element={<SuspendedRoute><ExpedientesList /></SuspendedRoute>} />
          {/* Note: ExpedienteDetalle usually takes an ID logic, but existing code relied on context. 
                    Migration: The existing ExpedienteDetalle might expect context state. 
                    For now, let's render it if context is set? Or stick to context for detail view temporarily? 
                    The plan said: /expedientes/:id -> ExpedienteDetalle
                    Let's assume for now we keep the list and detail separate pages. */}
          <Route path="expedientes/:id" element={<SuspendedRoute><ExpedienteDetalle /></SuspendedRoute>} />

          <Route path="auditoria" element={<SuspendedRoute><DashboardAuditoriaSIE /></SuspendedRoute>} />
          <Route path="mediacion" element={<SuspendedRoute><CentroMediacionGCC /></SuspendedRoute>} />
          <Route path="calendario" element={<SuspendedRoute><CalendarioPlazosLegales /></SuspendedRoute>} />
          <Route path="bitacora" element={<SuspendedRoute><BitacoraPsicosocial /></SuspendedRoute>} />
          <Route path="evidencias" element={<SuspendedRoute><GestionEvidencias /></SuspendedRoute>} />
          <Route path="apoyo" element={<SuspendedRoute><SeguimientoApoyo /></SuspendedRoute>} />
          <Route path="salida" element={<SuspendedRoute><BitacoraSalida /></SuspendedRoute>} />
          <Route path="archivo" element={<SuspendedRoute><ArchivoDocumental /></SuspendedRoute>} />
          <Route path="patio" element={<SuspendedRoute><ReportePatio /></SuspendedRoute>} />
          <Route path="patio/lista" element={<SuspendedRoute><ListaReportesPatio /></SuspendedRoute>} />
          <Route path="perfil" element={<SuspendedRoute><PerfilUsuario /></SuspendedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>

      {/* Global Modals/Overlays */}
      <Suspense fallback={null}>
        {isWizardOpen && <ExpedienteWizard />}
        <LegalAssistant />
      </Suspense>
    </>
  );
}

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
    <BrowserRouter>
      <ConvivenciaProvider>
        {!isOnline && (
          <div className="fixed top-0 inset-x-0 z-50 bg-amber-500 text-slate-900 text-xs font-black text-center py-2">
            Modo offline: algunas funciones pueden no estar disponibles.
          </div>
        )}
        <div className={isOnline ? '' : 'pt-8'}>
          <AppRoutes />
        </div>
      </ConvivenciaProvider>
    </BrowserRouter>
  );
};

export default App;
