
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { useConvivencia } from '../context/ConvivenciaContext';
import { withRetry } from '../utils/retry';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  ShieldAlert, 
  Scale, 
  Gavel,
  Loader2
} from 'lucide-react';

const LegalAssistant: React.FC = () => {
  const { isAssistantOpen, setIsAssistantOpen, expedienteSeleccionado } = useConvivencia();
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: 'Hola, soy tu Asistente Experto en Normativa Escolar. ¿En qué puedo ayudarte hoy respecto a las Circulares 781 y 782?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input;
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsTyping(true);

    try {
      if (!navigator.onLine) {
        setMessages(prev => [
          ...prev,
          { role: 'ai', text: 'Estás en modo offline. Revisa tu conexión e intenta nuevamente.' }
        ]);
        return;
      }

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
      if (!apiKey) {
        setMessages(prev => [
          ...prev,
          { role: 'ai', text: 'No hay API Key configurada para el asistente legal. Configura VITE_GEMINI_API_KEY en `.env.local`.' }
        ]);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });

      // Fix: Corrected property name from 'estado' to 'etapa'
      const contextPrompt = expedienteSeleccionado 
        ? `Contexto del caso actual: Expediente ${expedienteSeleccionado.id}, Estudiante ${expedienteSeleccionado.nnaNombre}, Estado: ${expedienteSeleccionado.etapa}, Gravedad: ${expedienteSeleccionado.gravedad}, Es proceso de expulsión: ${expedienteSeleccionado.esProcesoExpulsion ? 'SÍ' : 'NO'}.`
        : 'No hay un expediente seleccionado actualmente.';

      const systemInstruction = `Actúa como un Senior Legal Counsel experto en la normativa de educación chilena, específicamente en las Circulares 781 y 782 de la Superintendencia de Educación. 
          Tu objetivo es guiar a los Encargados de Convivencia para asegurar el CUMPLIMIENTO DEL DEBIDO PROCESO. 
          
          Reglas:
          1. Siempre cita o referencia la importancia de la gradualidad de las medidas.
          2. Si se menciona expulsión, recuerda el hito obligatorio de consulta al Consejo de Profesores.
          3. Mantén un tono profesional, preventivo y resolutivo.
          4. No des consejos fuera de la normativa chilena de educación.
          5. Si hay un expediente en contexto, úsalo para dar consejos específicos.
          
          Contexto actual de la plataforma: ${contextPrompt}`;

      const response = await withRetry(
        () =>
          ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: userMessage,
            config: {
              systemInstruction,
            },
          }),
        { retries: 2, baseDelayMs: 600 }
      );

      const aiText = response?.text || "Lo siento, tuve un problema analizando la normativa. Por favor, intenta de nuevo.";
      setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'ai', text: "Error de conexión con el motor de IA. Verifica tu suscripción o conexión." }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isAssistantOpen) return (
    <button 
      onClick={() => setIsAssistantOpen(true)}
      className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl shadow-blue-400 flex items-center justify-center hover:scale-110 transition-transform active:scale-95 z-40 group"
    >
      <Bot className="w-6 h-6" />
      <div className="absolute right-16 px-3 py-1 bg-slate-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-bold">
        Consultoría IA Normativa
      </div>
    </button>
  );

  return (
    <div className="fixed bottom-4 right-4 left-4 md:left-auto md:bottom-6 md:right-6 w-auto md:w-[400px] h-[70vh] md:h-[600px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 animate-in slide-in-from-bottom-8 duration-300 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-slate-900 text-white flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500 rounded-lg">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold leading-none">Asistente Normativo</h4>
            <p className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-tighter">AI-Powered Compliance</p>
          </div>
        </div>
        <button 
          onClick={() => setIsAssistantOpen(false)}
          className="p-1 hover:bg-slate-800 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Case Context Warning */}
      {expedienteSeleccionado && (
        <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 flex items-center space-x-2 shrink-0">
          <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-[10px] font-bold text-blue-700 uppercase">Auditando: {expedienteSeleccionado.id}</span>
        </div>
      )}

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50"
      >
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-100' 
                : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'
            }`}>
              {m.text.split('\n').map((line, idx) => <p key={idx} className="mb-1">{line}</p>)}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center space-x-2">
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
              <span className="text-xs text-slate-400 font-medium italic">Analizando Circulares...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Prompts */}
      <div className="p-2 px-4 flex gap-2 overflow-x-auto no-scrollbar border-t border-slate-100 shrink-0 bg-white">
        {[
          { label: 'Auditar caso', icon: Gavel },
          { label: 'Plazos 781', icon: Scale },
          { label: 'Aula Segura', icon: ShieldAlert },
        ].map(p => (
          <button 
            key={p.label}
            onClick={() => setInput(p.label)}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full border border-slate-200 text-[10px] font-bold text-slate-500 hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            <p.icon className="w-3 h-3" />
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-100 shrink-0">
        <div className="relative">
          <textarea
            rows={1}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="Consulta legal..."
            className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${
              input.trim() && !isTyping ? 'text-blue-600 hover:bg-blue-50' : 'text-slate-300'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[9px] text-center text-slate-400 mt-2 font-medium">
          La IA puede cometer errores. Valide siempre con su equipo jurídico.
        </p>
      </div>
    </div>
  );
};

export default LegalAssistant;
