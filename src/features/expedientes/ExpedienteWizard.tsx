import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useConvivencia, hitosBase } from '@/shared/context/ConvivenciaContext';
import { Expediente } from '@/types';
import { supabase } from '@/shared/lib/supabaseClient';
import {
  UserPlus,
  Scale,
  Info,
  Clock,
  CheckCircle2
} from 'lucide-react';

import { WizardHeader } from './wizard/WizardHeader';
import { WizardProgressBar } from './wizard/WizardProgressBar';
import { WizardFooter } from './wizard/WizardFooter';
import { WizardStep1Clasificacion } from './wizard/WizardStep1Clasificacion';
import { WizardStep2Gradualidad } from './wizard/WizardStep2Gradualidad';
import { WizardStep3Hechos } from './wizard/WizardStep3Hechos';
import { WizardStep4Plazos } from './wizard/WizardStep4Plazos';
import { WizardStep5Confirmar } from './wizard/WizardStep5Confirmar';
import { ExpedienteFormValues, StepConfig } from './wizard/wizard.types';

// Schema Definition
const expedienteSchema = z.object({
  estudianteId: z.string().min(1, 'Debe seleccionar un estudiante'),
  gravedad: z.enum(['LEVE', 'RELEVANTE', 'GRAVISIMA_EXPULSION']),
  advertenciaEscrita: z.boolean(),
  planApoyoPrevio: z.boolean(),
  descripcionHechos: z.string().min(10, 'La descripción debe ser detallada (mínimo 10 caracteres)'),
  fechaIncidente: z.string().min(1, 'Fecha requerida'),
  horaIncidente: z.string().min(1, 'Hora requerida'),
  lugarIncidente: z.string().min(3, 'Indique el lugar del incidente'),
});

type FormValues = z.infer<typeof expedienteSchema>;

const ExpedienteWizard: React.FC = () => {
  const { setIsWizardOpen, setExpedientes, calcularPlazoLegal, estudiantes } = useConvivencia();
  const [step, setStep] = React.useState(1);

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(expedienteSchema),
    mode: 'onChange',
    defaultValues: {
      estudianteId: '',
      gravedad: 'LEVE',
      advertenciaEscrita: false,
      planApoyoPrevio: false,
      descripcionHechos: '',
      fechaIncidente: new Date().toISOString().split('T')[0],
      horaIncidente: '10:00',
      lugarIncidente: '',
    }
  });

  const formData = watch();
  const selectedEstudiante = useMemo(
    () => estudiantes.find((e) => e.id === formData.estudianteId),
    [estudiantes, formData.estudianteId]
  );
  const isExpulsion = formData.gravedad === 'GRAVISIMA_EXPULSION';
  const hasIncompleteGraduality = isExpulsion && (!formData.advertenciaEscrita || !formData.planApoyoPrevio);

  const stepsConfig: StepConfig[] = [
    { id: 1, title: 'Clasificación', icon: UserPlus },
    { id: 2, title: 'Gradualidad', icon: Scale, hidden: !isExpulsion },
    { id: 3, title: 'Hechos', icon: Info },
    { id: 4, title: 'Plazos', icon: Clock },
    { id: 5, title: 'Confirmar', icon: CheckCircle2 },
  ].filter(s => !s.hidden);

  const activeStepConfig = stepsConfig.find(s => s.id === step) || stepsConfig[0];
  const activeIndex = stepsConfig.findIndex(s => s.id === step);

  const plazoCalculado = useMemo(() => {
    return calcularPlazoLegal(new Date(), formData.gravedad);
  }, [formData.gravedad, calcularPlazoLegal]);

  const handleNext = () => {
    const nextIdx = activeIndex + 1;
    if (nextIdx < stepsConfig.length) {
      setStep(stepsConfig[nextIdx].id);
    }
  };

  const handleBack = () => {
    const prevIdx = activeIndex - 1;
    if (prevIdx >= 0) {
      setStep(stepsConfig[prevIdx].id);
    }
  };

  const onSubmit = async (data: FormValues) => {
    const estudiante = estudiantes.find(e => e.id === data.estudianteId);
    const nombreEstudiante = estudiante?.nombreCompleto ?? 'Sin nombre';
    const cursoEstudiante = estudiante?.curso ?? null;
    const tipoFalta = data.gravedad === 'LEVE'
      ? 'leve'
      : data.gravedad === 'RELEVANTE'
        ? 'relevante'
        : 'expulsion';
    const folio = `EXP-${new Date().getFullYear()}-${Math.floor(Math.random() * 900) + 100}`;
    const nuevoExp: Expediente = {
      id: folio,
      nnaNombre: nombreEstudiante,
      nnaCurso: cursoEstudiante,
      etapa: 'INICIO',
      gravedad: data.gravedad,
      fechaInicio: new Date().toISOString(),
      plazoFatal: plazoCalculado.toISOString(),
      encargadoId: 'u1',
      esProcesoExpulsion: isExpulsion,
      accionesPrevias: data.advertenciaEscrita && data.planApoyoPrevio,
      hitos: hitosBase(isExpulsion)
    };

    if (supabase) {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;

      if (userId) {
        const { data: inserted, error } = await supabase
          .from('expedientes')
          .insert({
            estudiante_id: data.estudianteId,
            folio,
            tipo_falta: tipoFalta,
            estado_legal: 'apertura',
            etapa_proceso: 'INICIO',
            fecha_inicio: new Date().toISOString(),
            plazo_fatal: plazoCalculado.toISOString(),
            creado_por: userId,
            acciones_previas: data.advertenciaEscrita && data.planApoyoPrevio,
            es_proceso_expulsion: isExpulsion,
            descripcion_hechos: data.descripcionHechos,
            fecha_incidente: data.fechaIncidente,
            hora_incidente: data.horaIncidente,
            lugar_incidente: data.lugarIncidente,
            curso: cursoEstudiante
          })
          .select('id')
          .single();

        if (!error && inserted?.id) {
          nuevoExp.dbId = inserted.id;
        } else if (error) {
          console.warn('Supabase: no se pudo crear expediente, usando fallback local', error);
        }
      } else {
        console.warn('Supabase: no hay sesión activa, usando fallback local');
      }
    }

    setExpedientes(prev => [nuevoExp, ...prev]);
    setIsWizardOpen(false);
  };

  const isNextDisabled = activeIndex === 0 && (!formData.estudianteId || !formData.gravedad);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        <WizardHeader
          stepConfig={activeStepConfig}
          activeIndex={activeIndex}
          onClose={() => setIsWizardOpen(false)}
        />

        <WizardProgressBar
          stepsConfig={stepsConfig}
          activeIndex={activeIndex}
        />

        <form id="wizard-form" onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-4 md:p-10">
          {step === 1 && (
            <WizardStep1Clasificacion
              register={register}
              control={control}
              errors={errors}
              estudiantes={estudiantes}
              setValue={setValue}
            />
          )}

          {step === 2 && isExpulsion && (
            <WizardStep2Gradualidad
              register={register}
              errors={errors}
              hasIncompleteGraduality={hasIncompleteGraduality}
            />
          )}

          {step === 3 && (
            <WizardStep3Hechos
              register={register}
              errors={errors}
            />
          )}

          {step === 4 && (
            <WizardStep4Plazos
              formData={formData as ExpedienteFormValues}
              plazoCalculado={plazoCalculado}
            />
          )}

          {step === 5 && (
            <WizardStep5Confirmar
              formData={formData as ExpedienteFormValues}
              selectedEstudiante={selectedEstudiante}
              isExpulsion={isExpulsion}
            />
          )}
        </form>

        <WizardFooter
          activeIndex={activeIndex}
          stepsConfig={stepsConfig}
          onNext={handleNext}
          onBack={handleBack}
          onClose={() => setIsWizardOpen(false)}
          isNextDisabled={isNextDisabled}
        />
      </div>
    </div>
  );
};

export default ExpedienteWizard;
