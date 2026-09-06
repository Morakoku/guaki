'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Image as ImageIcon, 
  X, 
  Copy, 
  Check, 
  Trash2, 
  Bot, 
  Sparkles, 
  Bug, 
  Layout, 
  Smartphone, 
  Zap,
  Activity,
  Loader2,
  Database
} from 'lucide-react';
import { NM_DARK as NM } from './neumorphism-styles';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  image?: string;
  timestamp: string;
  promptToCopy?: string;
  tag?: string;
}

export default function AntigravityCopilotChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load persistent history
  useEffect(() => {
    try {
      const saved = localStorage.getItem('guaki_command_copilot_history_v2');
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        const welcome: ChatMessage = {
          id: 'msg_welcome',
          sender: 'assistant',
          text: '👋 ¡Hola! Soy el Copilot de Antigravity conectado al backend en tiempo real de **La Trinidad**.\n\nPuedes consultarme métricas de la base de datos, ejecutar diagnósticos Business MRI de Veyra, adjuntar capturas de pantalla o reportar errores visuales.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          tag: 'Conectado en Vivo'
        };
        setMessages([welcome]);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Save on update
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem('guaki_command_copilot_history_v2', JSON.stringify(messages));
      } catch (e) {
        // Ignore storage quota
      }
    }
  }, [messages]);

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (customText?: string, action: 'general' | 'audit_veyra' | 'status' = 'general', metadata: Record<string, any> = {}) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() && !selectedImage && action === 'general') return;

    const userMsg: ChatMessage = {
      id: 'msg_user_' + Date.now(),
      sender: 'user',
      text: textToSend || (action === 'audit_veyra' ? '🩺 Ejecutar Business MRI en Veyra' : '🎛️ Consultar estado en vivo'),
      image: selectedImage || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      tag: action === 'audit_veyra' ? 'Veyra MRI' : action === 'status' ? 'Ecosistema' : 'Consulta'
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    const imagePayload = selectedImage;
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/command-center/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          image: imagePayload || undefined,
          action,
          metadata,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const assistantMsg: ChatMessage = {
          id: 'msg_asst_' + Date.now(),
          sender: 'assistant',
          text: data.response,
          promptToCopy: data.promptToCopy,
          timestamp: data.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          tag: data.categoryTag || userMsg.tag
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        const errorMsg: ChatMessage = {
          id: 'msg_err_' + Date.now(),
          sender: 'assistant',
          text: '⚠️ ' + (data.error || 'No se pudo procesar la solicitud en el backend.'),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          tag: 'Error'
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err) {
      const networkErrorMsg: ChatMessage = {
        id: 'msg_err_' + Date.now(),
        sender: 'assistant',
        text: '❌ Error de red conectando con el backend del Copilot.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tag: 'Error'
      };
      setMessages((prev) => [...prev, networkErrorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearHistory = () => {
    localStorage.removeItem('guaki_command_copilot_history_v2');
    setMessages([]);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* Top Banner */}
      <div style={{ ...NM.card, padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '16px', backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'grid', placeItems: 'center', color: '#10B981' }}>
            <Bot size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#F9FAFB', margin: 0 }}>Copilot & Feedback AI Real</h2>
              <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34D399', fontSize: '0.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: '9999px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                API LIVE
              </span>
            </div>
            <p style={{ fontSize: '0.84rem', color: '#94A3B8', margin: '4px 0 0' }}>Conectado a la base de datos de Guaki, VeyraStore y el enrutador de Mapache.</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={clearHistory}
            style={{ ...NM.buttonConvex, padding: '8px 14px', fontSize: '0.78rem', color: '#F87171', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Trash2 size={14} /> Limpiar Chat
          </button>
        </div>
      </div>

      {/* Live System Action Pills */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
        <button
          disabled={isLoading}
          onClick={() => handleSendMessage('Consultar métricas y salud en vivo del ecosistema La Trinidad.', 'status')}
          style={{ ...NM.buttonConvex, padding: '8px 16px', fontSize: '0.78rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px', color: '#60A5FA' }}
        >
          <Activity size={14} /> 🎛️ Estado del Ecosistema
        </button>

        <button
          disabled={isLoading}
          onClick={() => handleSendMessage('Generar diagnóstico Business MRI para clínica odontológica demo.', 'audit_veyra', { companyName: 'Dental Elite La Trinidad', category: 'Odontología Especializada', city: 'Medellín' })}
          style={{ ...NM.buttonConvex, padding: '8px 16px', fontSize: '0.78rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px', color: '#FBBF24' }}
        >
          <Zap size={14} /> 🩺 Ejecutar Veyra MRI Real
        </button>

        <button
          disabled={isLoading}
          onClick={() => handleSendMessage('Verificar consistencia de tokens neumórficos #E0E0E0 y ausencia de animaciones infinitas.', 'general')}
          style={{ ...NM.buttonConvex, padding: '8px 16px', fontSize: '0.78rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px', color: '#34D399' }}
        >
          <Layout size={14} /> 💎 Chequeo Neumorphism #E0E0E0
        </button>

        <button
          disabled={isLoading}
          onClick={() => handleSendMessage('Auditar padding y visualización en pantallas móviles (360px a 414px).', 'general')}
          style={{ ...NM.buttonConvex, padding: '8px 16px', fontSize: '0.78rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px', color: '#C084FC' }}
        >
          <Smartphone size={14} /> 📱 Auditoría Móvil
        </button>
      </div>

      {/* Chat Area */}
      <div style={{ ...NM.inset, borderRadius: '24px', padding: '20px', minHeight: '440px', maxHeight: '580px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.length === 0 ? (
          <div style={{ margin: 'auto', textAlign: 'center', color: '#94A3B8', padding: '40px 20px' }}>
            <Sparkles size={36} style={{ color: '#10B981', margin: '0 auto 12px', opacity: 0.8 }} />
            <strong style={{ display: 'block', color: '#F9FAFB', fontSize: '1rem', marginBottom: '6px' }}>Sin mensajes aún</strong>
            <p style={{ fontSize: '0.85rem', maxWidth: '380px', margin: '0 auto' }}>Escribe o presiona una de las acciones rápidas para interactuar en vivo.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div
                style={{
                  padding: '14px 18px',
                  borderRadius: msg.sender === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                  backgroundColor: msg.sender === 'user' ? '#10B981' : '#141923',
                  color: msg.sender === 'user' ? '#FFFFFF' : '#F9FAFB',
                  boxShadow: msg.sender === 'user' ? '4px 4px 12px rgba(16, 185, 129, 0.25)' : '4px 4px 12px #0B0E13, -4px -4px 12px #191E2B',
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                }}
              >
                {msg.tag && (
                  <span
                    style={{
                      display: 'inline-block',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      marginBottom: '8px',
                      backgroundColor: msg.sender === 'user' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                      color: msg.sender === 'user' ? '#FFFFFF' : '#34D399',
                    }}
                  >
                    {msg.tag}
                  </span>
                )}

                {msg.image && (
                  <div style={{ marginBottom: '10px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={msg.image} alt="Adjunto" style={{ maxWidth: '100%', maxHeight: '240px', display: 'block', objectFit: 'contain', backgroundColor: '#000000' }} />
                  </div>
                )}

                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>

                {msg.promptToCopy && (
                  <div style={{ marginTop: '12px', padding: '12px', borderRadius: '12px', backgroundColor: '#0A0D14', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.72rem', color: '#34D399', fontWeight: 800 }}>PROMPT GENERADO:</span>
                      <button
                        onClick={() => copyToClipboard(msg.id, msg.promptToCopy!)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: copiedId === msg.id ? '#34D399' : '#94A3B8',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                        }}
                      >
                        {copiedId === msg.id ? <><Check size={12} /> Copiado</> : <><Copy size={12} /> Copiar Prompt</>}
                      </button>
                    </div>
                    <pre style={{ margin: 0, fontSize: '0.78rem', color: '#E2E8F0', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                      {msg.promptToCopy}
                    </pre>
                  </div>
                )}
              </div>
              <span style={{ fontSize: '0.68rem', color: '#64748B', alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', padding: '0 4px' }}>
                {msg.timestamp}
              </span>
            </div>
          ))
        )}

        {isLoading && (
          <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 18px', borderRadius: '20px', backgroundColor: '#141923', color: '#34D399', fontSize: '0.86rem' }}>
            <Loader2 size={16} className="animate-spin" /> Procesando consulta en el backend...
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Preview Attached Image */}
      {selectedImage && (
        <div style={{ ...NM.cardSmall, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={selectedImage} alt="Preview" style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover' }} />
            <span style={{ fontSize: '0.82rem', color: '#34D399', fontWeight: 700 }}>1 captura lista para analizar</span>
          </div>
          <button
            onClick={() => setSelectedImage(null)}
            style={{ background: 'transparent', border: 'none', color: '#F87171', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Input Box */}
      <div style={{ ...NM.card, padding: '14px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          style={{ display: 'none' }}
        />

        <button
          type="button"
          disabled={isLoading}
          onClick={() => fileInputRef.current?.click()}
          style={{
            ...NM.buttonConvex,
            width: '44px',
            height: '44px',
            borderRadius: '14px',
            display: 'grid',
            placeItems: 'center',
            color: selectedImage ? '#10B981' : '#94A3B8',
            flexShrink: 0,
            opacity: isLoading ? 0.6 : 1,
          }}
          title="Adjuntar captura de pantalla"
        >
          <ImageIcon size={20} />
        </button>

        <input
          type="text"
          disabled={isLoading}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="Escribe tu consulta o reporte técnico..."
          style={{
            ...NM.input,
            flex: 1,
            height: '44px',
            opacity: isLoading ? 0.7 : 1,
          }}
        />

        <button
          type="button"
          disabled={isLoading}
          onClick={() => handleSendMessage()}
          style={{
            ...NM.buttonEmerald,
            width: '44px',
            height: '44px',
            borderRadius: '14px',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
            opacity: isLoading ? 0.6 : 1,
          }}
          title="Enviar"
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>

    </div>
  );
}
