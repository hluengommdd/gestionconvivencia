// Context Layer
// Provides React contexts for global state management

// Re-export from providers
export * from './providers';

// Legacy exports (for backward compatibility)
// The ConvivenciaContext is deprecated in favor of the new divided contexts
// Import from providers directly for new code
export {
  useExpedientesContext as useConvivencia,
  ExpedientesProvider,
  UIProvider,
} from './providers';
