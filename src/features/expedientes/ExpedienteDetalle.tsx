
import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useConvivencia } from '@/shared/context/ConvivenciaContext';
import { supabase } from '@/shared/lib/supabaseClient';
import { EvidenciaQueryRow } from '@/shared/types/supabase';
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Users2,
  AlertTriangle,
  Calendar,
  ShieldCheck,
  FileSearch,
  MessageSquare,
  ImageIcon,
  History,
  Scale,
  Gavel,
  Check,
  ShieldAlert
} from 'lucide-react';
import NormativeBadge from '@/shared/components/NormativeBadge';
import PlazoCounter from '@/shared/components/PlazoCounter';
import GeneradorResolucion from '@/features/legal/GeneradorResolucion';
import { EtapaProceso } from '@/types';
import { useLocalDraft } from '@/shared/utils/useLocalDraft';

const STEP_CONFIG: Record<string, { title: string; dateLabel: string; placeholder: string; hitoTitle: string }> = {
  INICIO: {
    title: 'Registro de Inicio',
    dateLabel: 'Fecha de Inicio',
    placeholder: 'Resumen inicial del caso...',
    hitoTitle: 'INICIO'
  },
  NOTIFICADO: {
    title: 'Registro de Notificacion',
    dateLabel: 'Fecha de Notificacion',
    placeholder: 'Detalle de la notificacion a apoderados...',
    hitoTitle: 'NOTIFICADO'
  },
  DESCARGOS: {
    title: 'Registro de Descargos (Acta de Escucha)',
    dateLabel: 'Fecha de Descargos',
    placeholder: 'Escriba aqui el resumen de la version del estudiante...',
    hitoTitle: 'DESCARGOS'
  },
  INVESTIGACION: {
    title: 'Registro de Investigacion',
    dateLabel: 'Fecha de Investigacion',
    placeholder: 'Resumen de entrevistas, recopilacion y analisis...',
    hitoTitle: 'INVESTIGACION'
  },
  RESOLUCION_PENDIENTE: {
    title: 'Registro de Resolucion',
    dateLabel: 'Fecha de Resolucion',
    placeholder: 'Resumen de la resolucion emitida...',
    hitoTitle: 'RESOLUCION'
  },
  RECONSIDERACION: {
    title: 'Registro de Reconsideracion',
    dateLabel: 'Fecha de Reconsideracion',
    placeholder: 'Resumen del proceso de reconsideracion...',
    hitoTitle: 'RECONSIDERACION'
  }
};

const STEPS = [
  { key: 'INICIO', label: 'Inicio', icon: FileSearch },
  { key: 'NOTIFICADO', label: 'Notificacion', icon: Calendar },
  { key: 'DESCARGOS', label: 'Descargos', icon: MessageSquare },
  { key: 'INVESTIGACION', label: 'Investigacion', icon: ShieldAlert },
  { key: 'RESOLUCION_PENDIENTE', label: 'Resolucion', icon: Gavel },
  { key: 'RECONSIDERACION', label: 'Apelacion', icon: Scale },
];

const ExpedienteDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { expedientes, actualizarEtapa, setExpedienteSeleccionado } = useConvivencia();

  const expedienteSeleccionado = useMemo(() =>
    expedientes.find(e => e.id === id),
    [expedientes, id]);

  const currentEtapa = expedienteSeleccionado?.etapa || 'INICIO';
  const hitoConfig = STEP_CONFIG[currentEtapa] || STEP_CONFIG.INICIO;
  const draftKey = useMemo(() => `expediente:${id ?? 'none'}:${hitoConfig.hitoTitle}:resumen`, [id, hitoConfig.hitoTitle]);
  const fechaKey = useMemo(() => `expediente:${id ?? 'none'}:${hitoConfig.hitoTitle}:fecha`, [id, hitoConfig.hitoTitle]);
  const [hitoResumen, setHitoResumen, clearHitoResumen] = useLocalDraft(draftKey, '');
  const [hitoFecha, setHitoFecha, clearFecha] = useLocalDraft(fechaKey, '');
  const [isGeneradorOpen, setIsGeneradorOpen] = useState(false);
  const [descargosHitoId, setDescargosHitoId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [evidenciasDb, setEvidenciasDb] = useState<any[]>([]);
  const [hitosDb, setHitosDb] = useState<any[]>([]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadNombre, setUploadNombre] = useState('');
  const [uploadTipo, setUploadTipo] = useState('PDF');
  const [uploadFuente, setUploadFuente] = useState('ESCUELA');
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Sync context for header breadcrumbs (optional, but good for now)
  useEffect(() => {
    const loadDescargos = async () => {
      if (!supabase || !expedienteSeleccionado?.dbId) return;
      const { data, error } = await supabase
        .from('hitos_expediente')
        .select('id, descripcion, fecha_cumplimiento')
        .eq('expediente_id', expedienteSeleccionado.dbId)
        .eq('titulo', hitoConfig.hitoTitle)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error || !data || data.length == 0) return;
      const row = data[0];
      if (row) {
        setDescargosHitoId(row.id);
        if (row.descripcion) setHitoResumen(row.descripcion);
        if (row.fecha_cumplimiento) setHitoFecha(row.fecha_cumplimiento);
      }
    };

    loadDescargos();
  }, [expedienteSeleccionado?.dbId, hitoConfig.hitoTitle]);

  useEffect(() => {
    const loadHitos = async () => {
      if (!supabase || !expedienteSeleccionado?.dbId) {
        setHitosDb([]);
        return;
      }
      const { data, error } = await supabase
        .from('hitos_expediente')
        .select('id, titulo, descripcion, fecha_cumplimiento, completado, created_at')
        .eq('expediente_id', expedienteSeleccionado.dbId)
        .order('created_at', { ascending: true });
      if (!error && data) {
        setHitosDb(data as any[]);
      }
    };

    loadHitos();
  }, [expedienteSeleccionado?.dbId]);

  useEffect(() => {
    const loadEvidencias = async () => {
      if (!supabase || !expedienteSeleccionado?.dbId) {
        setEvidenciasDb([]);
        return;
      }
      const { data, error } = await supabase
        .from('evidencias')
        .select('id, nombre, tipo, fecha, url_storage, created_at')
        .eq('expediente_id', expedienteSeleccionado.dbId)
        .order('created_at', { ascending: false });
      if (!error && data) {
        const withUrls = await Promise.all(data.map(async (row: EvidenciaQueryRow) => {
          const raw = row.url_storage || '';
          const parts = raw.split('/');
          const bucket = raw.startsWith('evidencias-') ? parts[0] : 'evidencias-publicas';
          const path = raw.startsWith('evidencias-') ? parts.slice(1).join('/') : raw;
          if (!path || !supabase) return { ...row, signed_url: '' };
          const { data: signed } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 10);
          return { ...row, signed_url: signed?.signedUrl ?? '' };
        }));
        setEvidenciasDb(withUrls);
      }
    };

    loadEvidencias();
  }, [expedienteSeleccionado?.dbId, hitoConfig.hitoTitle]);

  useEffect(() => {
    if (expedienteSeleccionado) {
      setExpedienteSeleccionado(expedienteSeleccionado);
    }
    return () => setExpedienteSeleccionado(null);
  }, [expedienteSeleccionado, setExpedienteSeleccionado]);


  if (!expedienteSeleccionado) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-700">Expediente no encontrado</h2>
          <button onClick={() => navigate('/expedientes')} className="mt-4 text-blue-600 hover:underline">
            Volver al listado
          </button>
        </div>
      </div>
    );
  }

  const currentStepIndex = STEPS.findIndex(s => s.key === expedienteSeleccionado.etapa);
  const isExpulsion = expedienteSeleccionado.gravedad === 'GRAVISIMA_EXPULSION';
  const puedeFinalizar = !isExpulsion || expedienteSeleccionado.accionesPrevias;
  const isLocked = expedienteSeleccionado.etapa.startsWith('CERRADO');

  const handleUploadEvidencia = async () => {
    if (!supabase) return;
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      setUploadStatus('Inicia sesion para subir evidencia.');
      return;
    }
    if (!expedienteSeleccionado?.dbId) {
      setUploadStatus('Expediente sin ID en base de datos.');
      return;
    }
    if (!uploadFile) {
      setUploadStatus('Selecciona un archivo.');
      return;
    }

    setIsUploading(true);
    setUploadStatus('');
    try {
      const safeName = uploadFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const bucket = uploadTipo === 'PDF' || uploadTipo === 'IMG' || uploadTipo === 'VIDEO' || uploadTipo === 'AUDIO' ? 'evidencias-publicas' : 'evidencias-publicas';
      const objectPath = `${expedienteSeleccionado.dbId}/${Date.now()}-${safeName}`;
      const { error: upError } = await supabase.storage
        .from(bucket)
        .upload(objectPath, uploadFile, { upsert: false });
      if (upError) {
        setUploadStatus('No se pudo subir el archivo.');
        return;
      }

      const { error: insError } = await supabase
        .from('evidencias')
        .insert({
          expediente_id: expedienteSeleccionado.dbId,
          url_storage: `${bucket}/${objectPath}`,
          tipo_archivo: uploadFile.type || 'application/octet-stream',
          subido_por: sessionData.session.user.id,
          nombre: uploadNombre || uploadFile.name,
          tipo: uploadTipo,
          fecha: new Date().toISOString().slice(0, 10),
          autor: sessionData.session.user.email || '',
          fuente: uploadFuente
        });

      if (insError) {
        setUploadStatus('No se pudo registrar la evidencia.');
      } else {
        setUploadStatus('Evidencia subida.');
        setUploadFile(null);
        setUploadNombre('');
        // reload list
        const { data } = await supabase
          .from('evidencias')
          .select('id, nombre, tipo, fecha, url_storage, created_at')
          .eq('expediente_id', expedienteSeleccionado.dbId)
          .order('created_at', { ascending: false });
        if (data) setEvidenciasDb(data as any[]);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveDescargos = async () => {
    if (!supabase) return;
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      setSaveStatus('Inicia sesion para guardar.');
      return;
    }
    if (!expedienteSeleccionado?.dbId) {
      setSaveStatus('No se puede guardar: expediente sin ID en base de datos.');
      return;
    }
    setIsSaving(true);
    setSaveStatus('');
    try {
      const payload = {
        expediente_id: expedienteSeleccionado.dbId,
        titulo: hitoConfig.hitoTitle,
        descripcion: hitoResumen || '',
        fecha_cumplimiento: hitoFecha || null,
        completado: Boolean(hitoResumen || hitoFecha),
        requiere_evidencia: true
      };

      let res;
      if (descargosHitoId) {
        res = await supabase
          .from('hitos_expediente')
          .update(payload)
          .eq('id', descargosHitoId)
          .select('id')
          .single();
      } else {
        res = await supabase
          .from('hitos_expediente')
          .insert(payload)
          .select('id')
          .single();
      }

      if (res.error) {
        setSaveStatus('No se pudo guardar. Revisa tu sesion.');
      } else {
        setDescargosHitoId(res.data.id);
        setSaveStatus('Guardado');
        // keep current etapa
        actualizarEtapa(expedienteSeleccionado.id, currentEtapa as any);
      }
    } catch (error) {
      setSaveStatus('No se pudo guardar.');
    } finally {
      setIsSaving(false);
    }
  };

  const evidencias = evidenciasDb.length > 0
    ? evidenciasDb.map((doc) => ({
        id: doc.id,
        name: doc.nombre || doc.url_storage || 'Archivo',
        type: doc.tipo || 'DOC',
        date: (doc.fecha || doc.created_at || '').toString().slice(0, 10),
        icon: doc.tipo === 'IMG' ? ImageIcon : FileText
      }))
    : [];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 animate-in fade-in slide-in-from-right-8 duration-500 pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4 md:gap-6">
            <button
              onClick={() => navigate('/expedientes')}
              className="p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:text-blue-600 border border-slate-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">{expedienteSeleccionado.id}</h2>
                <NormativeBadge gravedad={expedienteSeleccionado.gravedad} />
              </div>
              <p className="text-slate-500 font-bold text-xs flex items-center uppercase tracking-widest">
                <Users2 className="w-4 h-4 mr-2 text-blue-500" />
                NNA: <span className="text-slate-900 ml-2">{expedienteSeleccionado.nnaNombre}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center flex-wrap gap-4">
            <PlazoCounter fechaLimite={expedienteSeleccionado.plazoFatal} />
            {isExpulsion && (
              <div className="bg-red-600 text-white px-4 py-2 rounded-xl text-[10px] font-black flex items-center shadow-lg border border-red-500 tracking-widest uppercase">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Ley Aula Segura
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-8">
        <section className="bg-white p-4 md:p-8 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/40">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-10 flex items-center">
            <History className="w-5 h-5 mr-3 text-blue-600" />
            Ruta Crítica de Cumplimiento (Circular 782)
          </h3>
          <div className="overflow-x-auto">
            <div className="relative flex justify-between items-start min-w-[720px]">
              <div className="absolute top-6 left-0 w-full h-1 bg-slate-100 -z-0"></div>
              {STEPS.map((step, idx) => {
                const isCompleted = idx < currentStepIndex || (idx === currentStepIndex && expedienteSeleccionado.etapa.startsWith('CERRADO'));
                const isCurrent = idx === currentStepIndex;
                const isClickable = !isLocked && step.key !== expedienteSeleccionado.etapa;
                return (
                  <button
                    key={step.key}
                    type="button"
                    onClick={() => isClickable && actualizarEtapa(expedienteSeleccionado.id, step.key as EtapaProceso)}
                    className={`relative z-10 flex flex-col items-center group w-1/6 px-2 ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
                    title={isLocked ? 'Etapa cerrada' : `Cambiar a ${step.label}`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-4 border-white shadow-lg ${isCompleted ? 'bg-emerald-500 text-white' :
                      isCurrent ? 'bg-blue-600 text-white scale-110' : 'bg-white text-slate-300 border-slate-100'
                      }`}>
                      {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <step.icon className="w-5 h-5" />}
                    </div>
                    <div className="mt-4 text-center">
                      <p className={`text-[9px] font-black uppercase tracking-tighter ${isCompleted ? 'text-emerald-600' : isCurrent ? 'text-blue-700' : 'text-slate-400'
                        }`}>
                        {step.label}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {isExpulsion && (
              <div className={`border-2 rounded-3xl p-8 relative overflow-hidden transition-all ${expedienteSeleccionado.accionesPrevias ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200 shadow-red-100 shadow-xl animate-pulse'}`}>
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <ShieldCheck className="w-24 h-24" />
                </div>
                <h3 className={`font-black text-sm uppercase tracking-widest flex items-center mb-6 ${expedienteSeleccionado.accionesPrevias ? 'text-emerald-900' : 'text-red-900'}`}>
                  {expedienteSeleccionado.accionesPrevias ? <CheckCircle2 className="w-5 h-5 mr-3" /> : <AlertTriangle className="w-5 h-5 mr-3" />}
                  Validación de Gradualidad (Art. 6 Circular 782)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`flex items-center p-4 rounded-2xl border-2 ${expedienteSeleccionado.accionesPrevias ? 'bg-emerald-100 border-emerald-200 text-emerald-700' : 'bg-white border-red-200 text-red-700'}`}>
                    <Check className="w-4 h-4 mr-3" />
                    <div>
                      <p className="text-[10px] font-black uppercase">Advertencia Escrita</p>
                    </div>
                  </div>
                  <div className={`flex items-center p-4 rounded-2xl border-2 ${expedienteSeleccionado.accionesPrevias ? 'bg-emerald-100 border-emerald-200 text-emerald-700' : 'bg-white border-red-200 text-red-700'}`}>
                    <Check className="w-4 h-4 mr-3" />
                    <div>
                      <p className="text-[10px] font-black uppercase">Apoyo Psicosocial</p>
                    </div>
                  </div>
                </div>
                {!expedienteSeleccionado.accionesPrevias && (
                  <div className="mt-6 p-4 bg-white rounded-xl border border-red-200">
                    <p className="text-[10px] text-red-600 font-bold flex items-center italic">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      BLOQUEO LEGAL: No se puede proceder con la resolución de expulsión sin acreditar estas medidas previas.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl p-4 md:p-8">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center">
                <MessageSquare className="w-5 h-5 mr-3 text-blue-600" />
                {hitoConfig.title}
              </h3>
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{hitoConfig.dateLabel}</label>
                  <input
                    type="date"
                    value={hitoFecha}
                    onChange={(e) => setHitoFecha(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                  />
                </div>
                <button
                  onClick={() => { clearHitoResumen(); clearFecha(); }}
                  className="self-end md:self-start px-4 py-3 bg-white border border-slate-200 text-slate-500 rounded-2xl text-[10px] font-black uppercase hover:bg-slate-50 transition-all"
                >
                  Limpiar borrador
                </button>
                <button
                  onClick={handleSaveDescargos}
                  disabled={isSaving}
                  className={`self-end md:self-start px-4 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${isSaving ? 'bg-slate-200 text-slate-400' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                  {isSaving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
              {saveStatus && (
                <p className="text-[10px] font-bold text-slate-500 mb-2">{saveStatus}</p>
              )}
              <textarea
                className="w-full h-40 bg-slate-50 border border-slate-200 rounded-3xl p-6 text-sm font-medium focus:ring-4 focus:ring-blue-500/5 focus:outline-none placeholder:text-slate-300"
                placeholder={hitoConfig.placeholder}
                value={hitoResumen}
                onChange={(e) => setHitoResumen(e.target.value)}
              />
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl p-4 md:p-8">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center">
                <History className="w-5 h-5 mr-3 text-blue-600" />
                Historial de Hitos
              </h3>
              {hitosDb.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Sin hitos registrados
                </div>
              ) : (
                <ol className="relative border-l border-slate-200 ml-3">
                  {hitosDb.map((hito) => (
                    <li key={hito.id} className="mb-6 ml-6">
                      <span className={`absolute -left-3 flex items-center justify-center w-6 h-6 rounded-full ${hito.completado ? 'bg-emerald-500' : 'bg-blue-500'} text-white text-[10px] font-black`}>
                        {hito.completado ? 'OK' : '...'}
                      </span>
                      <div className="flex items-center gap-2">
                        <p className="text-[11px] font-black uppercase tracking-widest text-slate-700">{hito.titulo}</p>
                        {hito.fecha_cumplimiento && (
                          <span className="text-[9px] font-bold text-slate-400">{String(hito.fecha_cumplimiento).slice(0, 10)}</span>
                        )}
                      </div>
                      {hito.descripcion && (
                        <p className="text-[11px] text-slate-600 mt-1">{hito.descripcion}</p>
                      )}
                    </li>
                  ))}
                </ol>
              )}
            </div>

            <div className="flex flex-col md:flex-row gap-4 pt-4">
              <button
                onClick={() => setIsGeneradorOpen(true)}
                disabled={!puedeFinalizar}
                className={`flex-1 flex items-center justify-center space-x-3 py-5 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.15em] transition-all shadow-xl ${puedeFinalizar
                  ? 'bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-700'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
              >
                <Gavel className="w-5 h-5" />
                <span>Emitir Resolución Final</span>
              </button>

              <button
                onClick={() => actualizarEtapa(expedienteSeleccionado.id, 'CERRADO_GCC')}
                className="flex-1 flex items-center justify-center space-x-3 py-5 rounded-[1.5rem] bg-emerald-600 text-white text-xs font-black uppercase tracking-[0.15em] hover:bg-emerald-700 shadow-xl shadow-emerald-600/20"
              >
                <Handshake className="w-5 h-5" />
                <span>Derivar a Mediación GCC</span>
              </button>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl p-8 flex flex-col h-full">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center">
                <FileText className="w-5 h-5 mr-3 text-blue-600" />
                Evidencia Indexada
              </h3>
              <div className="space-y-3 flex-1">
                {evidencias.length === 0 ? (
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Sin evidencias
                  </div>
                ) : (
                  evidencias.map((doc) => (
                    <div key={doc.id} className="flex items-center p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-blue-50 transition-all cursor-pointer">
                      <doc.icon className="w-5 h-5 text-blue-600 mr-4" />
                      <div className="flex-1 overflow-hidden">
                        <p className="text-[11px] font-black text-slate-700 truncate uppercase">{doc.name}</p>
                        <p className="text-[9px] font-bold text-slate-400 italic">{doc.date}</p>
                      </div>
                    </div>
                  ))
                )}

                <div className="mt-4 border-t border-slate-100 pt-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Subir evidencia</p>
                  <input
                    type="file"
                    onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                    className="w-full text-[10px] font-bold text-slate-500"
                  />
                  <input
                    value={uploadNombre}
                    onChange={(e) => setUploadNombre(e.target.value)}
                    placeholder="Nombre"
                    className="mt-2 w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <select
                      value={uploadTipo}
                      onChange={(e) => setUploadTipo(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold"
                    >
                      <option value="IMG">IMG</option>
                      <option value="VIDEO">VIDEO</option>
                      <option value="AUDIO">AUDIO</option>
                      <option value="PDF">PDF</option>
                    </select>
                    <select
                      value={uploadFuente}
                      onChange={(e) => setUploadFuente(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold"
                    >
                      <option value="ESCUELA">ESCUELA</option>
                      <option value="APODERADO">APODERADO</option>
                      <option value="SIE">SIE</option>
                    </select>
                  </div>
                  {uploadStatus && (
                    <p className="mt-2 text-[10px] font-bold text-slate-500">{uploadStatus}</p>
                  )}
                  <button
                    onClick={handleUploadEvidencia}
                    disabled={isUploading}
                    className={`mt-2 w-full px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest ${isUploading ? 'bg-slate-200 text-slate-400' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                  >
                    {isUploading ? 'Subiendo...' : 'Subir evidencia'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isGeneradorOpen && <GeneradorResolucion onClose={() => setIsGeneradorOpen(false)} />}
    </div>
  );
};

const Handshake: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m11 17 2 2 6-6" /><path d="m18 10 1-1a2 2 0 0 0-3-3l-1 1" /><path d="m14 14 1 1a2 2 0 0 0 3 0l.5-.5" /><path d="m8 5.8a2.1 2.1 0 0 1 2.1-2.1c1.1 0 2 1 2 2.1a2.1 2.1 0 0 1-2.1 2.1c-1.1 0-2-1-2-2.1Z" /><path d="M10.5 9.9a4.8 4.8 0 0 0-6.3 1.8A5.2 5.2 0 0 0 5.6 18l.8.7" /><path d="M7 15h2" /><path d="m15 18-2 2" /></svg>
);

export default ExpedienteDetalle;