/**
 * Centro de Mediación GCC - Gestión Colaborativa de Conflictos
 * Cumple con Circular 782, Artículo 8 - Mecanismos de Resolución Pacífica
 *
 * Funcionalidades:
 * - Derivación automática de expedientes a GCC
 * - Registro de procesos de mediación
 * - Seguimiento de compromisos reparatorios
 * - Cierre formativo de expedientes
 */

import React, { useState, useEffect } from 'react';
import { useConvivencia } from '@/shared/context/ConvivenciaContext';
import {
  Handshake,
  CheckCircle,
  Clock,
  Plus,
  Trash2,
  Users,
  FileText,
  Info,
  Calendar,
  ShieldCheck,
  AlertCircle,
  Send,
  X,
  FileCheck
} from 'lucide-react';
import {
  ResultadoMediacion,
} from '@/types';
import { useAuth } from '@/shared/hooks/useAuth';

/**
 * Compromiso reparatorio
 */
interface Compromiso {
  id: string;
  descripcion: string;
  fechaCumplimiento: string;
  responsable: string;
  completado: boolean;
}

/**
 * Componente de Derivación a GCC
 */
interface DerivacionFormProps {
  expedienteId: string;
  estudianteNombre: string;
  onDerivacionCompleta: () => void;
  onCancelar: () => void;
}

const DerivacionForm: React.FC<DerivacionFormProps> = ({
  expedienteId,
  estudianteNombre,
  onDerivacionCompleta,
  onCancelar
}) => {
  const { user } = useAuth();
  const [motivo, setMotivo] = useState('');
  const [objetivos, setObjetivos] = useState<string[]>(['']);
  const [mediadorAsignado, setMediadorAsignado] = useState('');
  const [fechaMediacion, setFechaMediacion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediadores = [
    'Psicóloga Ana María González',
    'Psicólogo Roberto Martínez',
    'Educadora Carla Herrera',
    'Orientador Luis Vega'
  ];

  const agregarObjetivo = () => setObjetivos([...objetivos, '']);

  const actualizarObjetivo = (index: number, valor: string) => {
    const nuevos = [...objetivos];
    nuevos[index] = valor;
    setObjetivos(nuevos);
  };

  const eliminarObjetivo = (index: number) => {
    setObjetivos(objetivos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Simular creación de derivación
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Derivación creada:', {
        expedienteId,
        motivo,
        objetivos: objetivos.filter(o => o.trim() !== ''),
        mediadorAsignado,
        fechaMediacion,
        usuarioId: user?.id
      });
      onDerivacionCompleta();
    } catch (err) {
      setError('Error al crear derivación');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-emerald-100 shadow-xl shadow-emerald-200/20 p-4 md:p-10 animate-in zoom-in-95 duration-300">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center">
          <Send className="w-6 h-6 mr-3 text-emerald-600" />
          Derivación a Centro de Mediación GCC
        </h3>
        <button onClick={onCancelar} className="p-2 text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-2xl">
        <p className="text-sm font-bold text-blue-800">
          Derivando a: <span className="font-black uppercase">{estudianteNombre}</span>
        </p>
        <p className="text-xs text-blue-600 mt-1">
          Folio: {expedienteId}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-sm font-bold text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
            Motivo de Derivación *
          </label>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            required
            rows={4}
            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-300 focus:outline-none resize-none"
            placeholder="Describa brevemente el conflicto que será derivado a mediación..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
            Objetivos de la Mediación
          </label>
          {objetivos.map((obj, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={obj}
                onChange={(e) => actualizarObjetivo(index, e.target.value)}
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-300 focus:outline-none"
                placeholder={`Objetivo ${index + 1}`}
              />
              {objetivos.length > 1 && (
                <button
                  type="button"
                  onClick={() => eliminarObjetivo(index)}
                  className="p-2 text-red-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={agregarObjetivo}
            className="flex items-center space-x-2 text-sm font-bold text-emerald-600 hover:text-emerald-700"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Objetivo</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
              Mediador Asignado
            </label>
            <select
              value={mediadorAsignado}
              onChange={(e) => setMediadorAsignado(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-300 focus:outline-none"
            >
              <option value="">Seleccionar mediador...</option>
              {mediadores.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
              Fecha Programada
            </label>
            <input
              type="date"
              value={fechaMediacion}
              onChange={(e) => setFechaMediacion(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-300 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex space-x-4 pt-4">
          <button
            type="button"
            onClick={onCancelar}
            className="flex-1 py-4 rounded-2xl border-2 border-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading || !motivo.trim()}
            className="flex-[2] py-4 rounded-2xl bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 shadow-xl shadow-emerald-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Derivando...' : 'Confirmar Derivación'}
          </button>
        </div>
      </form>
    </div>
  );
};

/**
 * Componente de Resultado de Mediación
 */
interface ResultadoFormProps {
  derivacionId: string;
  expedienteId: string;
  onCompleto: () => void;
}

const ResultadoForm: React.FC<ResultadoFormProps> = ({
  derivacionId,
  expedienteId,
  onCompleto
}) => {
  const { user } = useAuth();
  const [resultado, setResultado] = useState<ResultadoMediacion>('sin_acuerdo');
  const [acuerdos, setAcuerdos] = useState<string[]>(['']);
  const [compromisos, setCompromisos] = useState<string[]>(['']);
  const [observaciones, setObservaciones] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const agregarAcuerdo = () => setAcuerdos([...acuerdos, '']);
  const agregarCompromiso = () => setCompromisos([...compromisos, '']);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Resultado registrado:', { derivacionId, expedienteId, resultado, acuerdos, compromisos, observaciones, userId: user?.id });
      onCompleto();
    } finally {
      setIsLoading(false);
    }
  };

  const resultados: { value: ResultadoMediacion; label: string; color: string }[] = [
    { value: 'acuerdo_total', label: 'Acuerdo Total', color: 'bg-emerald-500' },
    { value: 'acuerdo_parcial', label: 'Acuerdo Parcial', color: 'bg-yellow-500' },
    { value: 'sin_acuerdo', label: 'Sin Acuerdo', color: 'bg-orange-500' },
    { value: 'no_conciliables', label: 'No Conciliables', color: 'bg-red-500' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
          Resultado de la Mediación *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {resultados.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setResultado(r.value)}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                resultado === r.value
                  ? `${r.color} text-white border-transparent shadow-lg`
                  : 'border-slate-200 text-slate-600 hover:border-emerald-300'
              }`}
            >
              <span className="text-xs font-black uppercase">{r.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
          Acuerdos Alcanzados
        </label>
        {acuerdos.map((a, i) => (
          <textarea
            key={i}
            value={a}
            onChange={(e) => {
              const nuevos = [...acuerdos];
              nuevos[i] = e.target.value;
              setAcuerdos(nuevos);
            }}
            rows={2}
            className="w-full px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-300 focus:outline-none resize-none"
            placeholder={`Acuerdo ${i + 1}`}
          />
        ))}
        <button
          type="button"
          onClick={agregarAcuerdo}
          className="flex items-center space-x-2 text-sm font-bold text-emerald-600 hover:text-emerald-700"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Acuerdo</span>
        </button>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
          Compromisos Reparatorios
        </label>
        {compromisos.map((c, i) => (
          <input
            key={i}
            type="text"
            value={c}
            onChange={(e) => {
              const nuevos = [...compromisos];
              nuevos[i] = e.target.value;
              setCompromisos(nuevos);
            }}
            className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-blue-500/5 focus:border-blue-300 focus:outline-none"
            placeholder={`Compromiso ${i + 1}`}
          />
        ))}
        <button
          type="button"
          onClick={agregarCompromiso}
          className="flex items-center space-x-2 text-sm font-bold text-blue-600 hover:text-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Compromiso</span>
        </button>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
          Observaciones
        </label>
        <textarea
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-300 focus:outline-none resize-none"
          placeholder="Observaciones adicionales..."
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 shadow-xl shadow-emerald-600/20 transition-all disabled:opacity-50"
      >
        {isLoading ? 'Guardando...' : 'Registrar Resultado'}
      </button>
    </form>
  );
};

/**
 * Componente Principal: Centro de Mediación GCC
 */
const CentroMediacionGCC: React.FC = () => {
  const { expedientes, setExpedientes, setExpedienteSeleccionado } = useConvivencia();

  // Estados
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [showDerivacionForm, setShowDerivacionForm] = useState(false);
  const [showResultadoForm, setShowResultadoForm] = useState(false);
  const [compromisos, setCompromisos] = useState<Compromiso[]>([]);
  const [statusGCC, setStatusGCC] = useState<'PROCESO' | 'LOGRADO' | 'NO_ACUERDO'>('PROCESO');

  // Datos del formulario
  const [facilitador, setFacilitador] = useState('Psicóloga Ana María González');
  const [nuevoCompromiso, setNuevoCompromiso] = useState({
    descripcion: '',
    fecha: '',
    responsable: ''
  });

  useEffect(() => {
    // Cargar mediaciones al montar
    console.log('Cargando mediaciones...');
  }, []);

  // Filtrar casos disponibles para GCC (usando valores de EtapaProceso正确os)
  const casosParaGCC = expedientes.filter(e =>
    e.etapa === 'INVESTIGACION' ||
    e.etapa === 'NOTIFICADO' ||
    e.etapa === 'DESCARGOS'
  );

  const casosConDerivacion = expedientes.filter(e =>
    e.etapa === 'CERRADO_GCC'
  );

  // Seleccionar caso
  const handleSelectCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    const exp = expedientes.find(e => e.id === caseId);
    if (exp) {
      setExpedienteSeleccionado(exp);
    }
    setShowDerivacionForm(false);
    setShowResultadoForm(false);
  };

  // Manejar derivación completa
  const handleDerivacionCompleta = () => {
    setShowDerivacionForm(false);
    // Actualizar estado del expediente a CERRADO_GCC
    if (selectedCaseId) {
      setExpedientes(prev => prev.map(e =>
        e.id === selectedCaseId ? { ...e, etapa: 'CERRADO_GCC' as const } : e
      ));
    }
    alert('Derivación a GCC completada exitosamente');
  };

  // Agregar compromiso
  const agregarCompromiso = () => {
    if (!nuevoCompromiso.descripcion || !nuevoCompromiso.fecha) return;

    const compromiso: Compromiso = {
      id: Math.random().toString(36).substr(2, 9),
      descripcion: nuevoCompromiso.descripcion,
      fechaCumplimiento: nuevoCompromiso.fecha,
      responsable: nuevoCompromiso.responsable || 'Estudiante',
      completado: false
    };

    setCompromisos(prev => [...prev, compromiso]);
    setNuevoCompromiso({ descripcion: '', fecha: '', responsable: '' });
  };

  // Eliminar compromiso
  const eliminarCompromiso = (id: string) => {
    setCompromisos(prev => prev.filter(c => c.id !== id));
  };

  // Toggle cumplimiento
  const toggleCumplimiento = (id: string) => {
    setCompromisos(prev => prev.map(c =>
      c.id === id ? { ...c, completado: !c.completado } : c
    ));
  };

  // Cierre exitoso
  const handleCierreExitoso = () => {
    if (selectedCaseId) {
      setExpedientes(prev => prev.map(e =>
        e.id === selectedCaseId ? { ...e, etapa: 'CERRADO_GCC' as const } : e
      ));
    }
    alert('Proceso GCC cerrado exitosamente. El expediente ha sido derivado a vía formativa.');
  };

  // Caso seleccionado
  const casoSeleccionado = selectedCaseId
    ? expedientes.find(e => e.id === selectedCaseId)
    : null;

  return (
    <main className="flex-1 p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-emerald-50/30 overflow-y-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center flex-wrap gap-4">
          <div className="p-4 bg-emerald-600 text-white rounded-[1.5rem] shadow-xl shadow-emerald-200">
            <Handshake className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Centro de Mediación Escolar (GCC)
            </h2>
            <p className="text-emerald-700 font-bold text-xs md:text-sm">
              Gestión de Conflictos con Enfoque Formativo - Circular 782
            </p>
          </div>
        </div>
        <div className="bg-white px-4 md:px-6 py-3 rounded-2xl border border-emerald-100 shadow-sm flex items-center space-x-4">
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-emerald-600"
              >
                {String.fromCharCode(64 + i)}
              </div>
            ))}
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            3 Facilitadores Activos
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Izquierda: Casos */}
        <section className="space-y-6">
          {/* Casos para derivar */}
          <div className="bg-white rounded-[2.5rem] border border-emerald-100 shadow-xl shadow-emerald-200/20 p-4 md:p-8">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center">
              <Users className="w-5 h-5 mr-3 text-emerald-600" />
              Casos Disponibles para GCC
            </h3>
            {casosParaGCC.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">
                No hay casos disponibles para derivación
              </p>
            ) : (
              <div className="space-y-3">
                {casosParaGCC.map(exp => (
                  <button
                    key={exp.id}
                    onClick={() => handleSelectCase(exp.id)}
                    className={`w-full p-4 md:p-6 rounded-[1.5rem] border-2 transition-all text-left ${
                      selectedCaseId === exp.id
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-50 bg-white hover:border-emerald-200 hover:bg-emerald-50/30'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className={`text-xs font-black uppercase tracking-tight ${
                        selectedCaseId === exp.id ? 'text-emerald-700' : 'text-slate-800'
                      }`}>
                        {exp.nnaNombre}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 font-mono mt-1">
                        Folio: {exp.id}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Casos en proceso */}
          <div className="bg-white rounded-[2.5rem] border border-blue-100 shadow-xl shadow-blue-200/20 p-4 md:p-8">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center">
              <Clock className="w-5 h-5 mr-3 text-blue-600" />
              Procesos GCC Activos
            </h3>
            {casosConDerivacion.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">
                No hay procesos activos
              </p>
            ) : (
              <div className="space-y-3">
                {casosConDerivacion.map(exp => (
                  <button
                    key={exp.id}
                    onClick={() => handleSelectCase(exp.id)}
                    className="w-full p-4 md:p-6 rounded-[1.5rem] border-2 border-blue-50 bg-blue-50/30 text-left hover:border-blue-200 transition-all"
                  >
                    <p className="text-xs font-black uppercase tracking-tight text-slate-800">
                      {exp.nnaNombre}
                    </p>
                    <p className="text-[10px] font-bold text-blue-600 uppercase mt-1">
                      En proceso GCC
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-emerald-600 text-white p-4 md:p-8 rounded-[2.5rem] shadow-2xl shadow-emerald-500/20 relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-all duration-700" />
            <h4 className="text-lg md:text-xl font-black uppercase tracking-tight mb-4">
              ¿Por qué GCC?
            </h4>
            <p className="text-[10px] md:text-[11px] text-emerald-100 font-medium leading-relaxed mb-6">
              La Circular 782 prioriza la resolución pacífica. Un acuerdo logrado mediante GCC
              extingue la necesidad de medidas punitivas y fomenta la reparación real del daño.
            </p>
          </div>
        </section>

        {/* Columna Derecha: Panel de Trabajo */}
        <section className="lg:col-span-2 space-y-8">
          {showDerivacionForm && casoSeleccionado ? (
            <DerivacionForm
              expedienteId={casoSeleccionado.id}
              estudianteNombre={casoSeleccionado.nnaNombre}
              onDerivacionCompleta={handleDerivacionCompleta}
              onCancelar={() => setShowDerivacionForm(false)}
            />
          ) : showResultadoForm && selectedCaseId ? (
            <div className="bg-white rounded-[2.5rem] border border-emerald-100 shadow-xl shadow-emerald-200/20 p-4 md:p-10">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center">
                  <FileCheck className="w-6 h-6 mr-3 text-emerald-600" />
                  Registrar Resultado de Mediación
                </h3>
                <button onClick={() => setShowResultadoForm(false)} className="p-2 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <ResultadoForm
                derivacionId={selectedCaseId}
                expedienteId={selectedCaseId}
                onCompleto={() => setShowResultadoForm(false)}
              />
            </div>
          ) : casoSeleccionado ? (
            <div className="bg-white rounded-[2.5rem] border border-emerald-100 shadow-xl shadow-emerald-200/20 p-4 md:p-10 animate-in zoom-in-95 duration-500">
              {/* Notificación de Suspensión */}
              <div className="mb-10 p-4 md:p-6 bg-blue-50 border-2 border-blue-200 border-dashed rounded-[2rem] flex items-center space-x-6">
                <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h5 className="text-[10px] font-black text-blue-800 uppercase tracking-widest mb-1">
                    Efecto Suspensivo Activo
                  </h5>
                  <p className="text-[11px] text-blue-600 font-bold leading-tight">
                    Mientras este proceso GCC esté en curso, el procedimiento disciplinario
                    punitivo (Folio {casoSeleccionado.id}) se mantiene en pausa legal.
                  </p>
                </div>
              </div>

              {/* Acciones rápidas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                <button
                  onClick={() => setShowDerivacionForm(true)}
                  className="p-4 md:p-6 bg-emerald-50 border-2 border-emerald-200 rounded-[1.5rem] hover:bg-emerald-100 transition-all flex items-center space-x-4"
                >
                  <Send className="w-6 h-6 text-emerald-600" />
                  <span className="text-sm font-black text-emerald-700 uppercase">
                    Nueva Derivación
                  </span>
                </button>
                <button
                  onClick={() => setShowResultadoForm(true)}
                  className="p-4 md:p-6 bg-blue-50 border-2 border-blue-200 rounded-[1.5rem] hover:bg-blue-100 transition-all flex items-center space-x-4"
                >
                  <FileCheck className="w-6 h-6 text-blue-600" />
                  <span className="text-sm font-black text-blue-700 uppercase">
                    Registrar Resultado
                  </span>
                </button>
              </div>

              {/* Formulario de Participantes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                    Facilitador Responsable
                  </label>
                  <input
                    type="text"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-300 transition-all"
                    value={facilitador}
                    onChange={e => setFacilitador(e.target.value)}
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                    Estado del Acuerdo
                  </label>
                  <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100">
                    {(['PROCESO', 'LOGRADO', 'NO_ACUERDO'] as const).map(s => (
                      <button
                        key={s}
                        onClick={() => setStatusGCC(s)}
                        className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${
                          statusGCC === s
                            ? 'bg-emerald-600 text-white shadow-lg'
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {s.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Panel de Compromisos Reparatorios */}
              <div className="space-y-6 mb-12">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-emerald-600" />
                    Compromisos Reparatorios
                  </h3>
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase">
                    {compromisos.length} Definidos
                  </span>
                </div>

                <div className="space-y-4">
                  {compromisos.map(c => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-4 md:p-6 bg-emerald-50/50 border border-emerald-100 rounded-[1.5rem] group hover:bg-emerald-50 transition-all"
                    >
                      <div className="flex items-center space-x-6">
                        <button
                          onClick={() => toggleCumplimiento(c.id)}
                          className={`p-2 rounded-xl border-2 transition-all ${
                            c.completado
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'bg-white border-emerald-200 text-emerald-600 hover:bg-emerald-500 hover:text-white'
                          }`}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <div>
                          <p className={`text-sm font-bold ${c.completado ? 'text-emerald-700 line-through' : 'text-slate-800'}`}>
                            {c.descripcion}
                          </p>
                          <div className="flex items-center mt-1 space-x-4">
                            <span className="text-[10px] font-black text-emerald-600 uppercase flex items-center">
                              <Users className="w-3 h-3 mr-1.5" />
                              {c.responsable}
                            </span>
                            <span className="text-[10px] font-black text-slate-400 uppercase flex items-center">
                              <Calendar className="w-3 h-3 mr-1.5" />
                              Plazo: {c.fechaCumplimiento}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => eliminarCompromiso(c.id)}
                        className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Formulario para nuevo compromiso */}
                <div className="bg-slate-50 border border-dashed border-slate-200 rounded-[1.5rem] p-4 md:p-8 space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Nuevo Compromiso de Mejora
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Ej: Disculpas públicas..."
                      className="md:col-span-2 px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-300 transition-all"
                      value={nuevoCompromiso.descripcion}
                      onChange={e => setNuevoCompromiso({...nuevoCompromiso, descripcion: e.target.value})}
                    />
                    <input
                      type="date"
                      className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-300 transition-all"
                      value={nuevoCompromiso.fecha}
                      onChange={e => setNuevoCompromiso({...nuevoCompromiso, fecha: e.target.value})}
                    />
                    <select
                      className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-300 transition-all"
                      value={nuevoCompromiso.responsable}
                      onChange={e => setNuevoCompromiso({...nuevoCompromiso, responsable: e.target.value})}
                    >
                      <option value="">Responsable...</option>
                      <option value="Estudiante">Estudiante</option>
                      <option value="Apoderado">Apoderado</option>
                      <option value="Docente">Docente</option>
                    </select>
                    <button
                      onClick={agregarCompromiso}
                      disabled={!nuevoCompromiso.descripcion || !nuevoCompromiso.fecha}
                      className="md:col-span-3 flex items-center justify-center space-x-2 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-200 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Agregar Compromiso</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Acciones Finales */}
              <div className="flex flex-col md:flex-row gap-6 pt-6 md:pt-10 border-t border-slate-100">
                <button className="flex-1 py-5 rounded-[1.5rem] bg-white border-2 border-slate-100 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:border-emerald-300 hover:text-emerald-600 transition-all flex items-center justify-center space-x-3">
                  <FileText className="w-5 h-5" />
                  <span>Previsualizar Acta</span>
                </button>
                <button
                  onClick={handleCierreExitoso}
                  disabled={statusGCC !== 'LOGRADO'}
                  className={`flex-[2] py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center space-x-4 active:scale-95 ${
                    statusGCC === 'LOGRADO'
                      ? 'bg-emerald-600 text-white shadow-emerald-600/20 hover:bg-emerald-700'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <ShieldCheck className="w-6 h-6" />
                  <span>Cierre Exitoso por Vía Formativa</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] border border-emerald-100 shadow-xl shadow-emerald-200/10 p-8 md:p-20 flex flex-col items-center justify-center text-center space-y-6 h-full">
              <div className="w-32 h-32 bg-emerald-50 text-emerald-300 rounded-[3rem] flex items-center justify-center mb-4">
                <Handshake className="w-16 h-16" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight uppercase">
                  Sala de Conciliación GCC
                </h3>
                <p className="text-slate-400 font-bold text-xs md:text-sm mt-2 max-w-sm">
                  Seleccione un proceso del listado izquierdo para iniciar el diseño del acuerdo reparatorio.
                </p>
              </div>
              <div className="flex items-center space-x-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-full">
                <Info className="w-4 h-4" />
                <span>Solo casos en Etapa de Investigación o Notificación</span>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default CentroMediacionGCC;
