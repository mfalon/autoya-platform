'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, Sparkles, Loader2, X } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatProps {
  onAgentFilter: (bodyTypes: string[], maxPrice?: number) => void;
}

const SUGGESTIONS = ['Pickups 4x4', 'SUVs', 'Algo económico', 'Hatchbacks', 'Toyota', 'Diesel'];

function mockAgentResponse(input: string): { text: string; bodyTypes?: string[]; maxPrice?: number } {
  const q = input.toLowerCase();
  if (q.includes('camioneta') || q.includes('pickup') || q.includes('hilux') || q.includes('ranger') || q.includes('4x4'))
    return { text: '¡Tenemos pickups disponibles! Hilux y Ranger son las reinas del segmento. Te las muestro ahora.', bodyTypes: ['pickup'] };
  if (q.includes('suv') || q.includes('tracker') || q.includes('duster') || q.includes('taos'))
    return { text: 'Los SUVs son el segmento más vendido en Argentina. Mirá lo que tenemos disponible en stock.', bodyTypes: ['suv'] };
  if (q.includes('hatchback') || q.includes('polo') || q.includes('onix') || q.includes('208'))
    return { text: 'Los hatchbacks son perfectos para la ciudad: económicos y fáciles de manejar. Acá las opciones.', bodyTypes: ['hatchback'] };
  if (q.includes('sedan') || q.includes('sedán') || q.includes('corolla') || q.includes('cronos'))
    return { text: 'Los sedanes ofrecen el mejor equilibrio entre comodidad y prestaciones. Mirá estas opciones.', bodyTypes: ['sedan'] };
  if (q.includes('diesel'))
    return { text: 'Para muchos kilómetros diarios el diesel es lo mejor. Filtré las pickups con motor diesel.', bodyTypes: ['pickup'] };
  if (q.includes('toyota'))
    return { text: 'Toyota tiene una de las mejores redes de servicio en el país. Acá los Toyota disponibles en stock.', bodyTypes: ['sedan', 'pickup'] };
  if (q.includes('económic') || q.includes('barato') || q.includes('accesible') || q.includes('bajo presupuesto'))
    return { text: 'Entendido. Filtrando opciones por precio para mostrarte lo mejor dentro de un presupuesto accesible.', maxPrice: 25_000_000 };
  if (q.includes('todo') || q.includes('todos') || q.includes('ver todo'))
    return { text: 'Mostrando todo el catálogo. Tenemos sedanes, hatchbacks, SUVs y pickups disponibles.', bodyTypes: [] };
  return { text: 'Podés preguntarme por tipo de auto (SUV, pickup, hatchback, sedán), marca (Toyota, VW, Chevrolet…) o por presupuesto. ¿Qué estás buscando hoy?' };
}

export default function AIChat({ onAgentFilter }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([{
    id: 'welcome',
    role: 'assistant',
    content: '¡Hola! Soy el Agente AutoYa. Decime qué tipo de auto buscás y te muestro las mejores opciones del stock en tiempo real. Podés decirme "mostrame camionetas", "quiero un SUV" o "algo económico".',
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || isLoading) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: msg }]);
    setInput('');
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
    const { text: res, bodyTypes, maxPrice } = mockAgentResponse(msg);
    if (bodyTypes !== undefined || maxPrice !== undefined) onAgentFilter(bodyTypes ?? [], maxPrice);
    setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: res }]);
    setIsLoading(false);
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border)',
      position: 'relative',
    }}>

      {/* ── Header ── */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-elevated)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        {/* AI avatar */}
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'var(--ai-dim)',
          border: '1px solid var(--ai-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Bot size={16} style={{ color: 'var(--ai)' }} />
        </div>

        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--fg-primary)' }}>
            Agente AutoYa
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
            <span style={{ fontSize: 11, color: 'var(--fg-secondary)' }}>Gemini · en línea</span>
          </div>
        </div>

        <Sparkles size={14} style={{ color: 'var(--ai)', opacity: 0.7 }} />
      </div>

      {/* ── AI label ── */}
      <div style={{
        margin: '12px 16px 0',
        padding: '8px 12px',
        background: 'var(--ai-dim)',
        border: '1px solid var(--ai-border)',
        borderRadius: 4,
        fontSize: 11,
        color: 'var(--ai)',
        letterSpacing: '0.05em',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <Sparkles size={11} /> Generative UI · Controla el catálogo en tiempo real
      </div>

      {/* ── Messages ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}
            >
              <div style={{
                maxWidth: '88%',
                padding: '10px 14px',
                borderRadius: 4,
                fontSize: 13,
                lineHeight: 1.6,
                ...(msg.role === 'user'
                  ? { background: 'var(--brand)', color: '#fff' }
                  : {
                    background: 'var(--bg-elevated)',
                    color: 'var(--fg-primary)',
                    border: '1px solid var(--border)',
                  })
              }}>
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 4,
              fontSize: 12,
              color: 'var(--fg-secondary)',
            }}>
              <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
              Procesando...
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Suggestions ── */}
      <div style={{
        padding: '8px 16px',
        borderTop: '1px solid var(--border)',
        display: 'flex', gap: 6, overflowX: 'auto',
        background: 'var(--bg-elevated)',
      }}>
        {SUGGESTIONS.map(s => (
          <button
            key={s}
            onClick={() => handleSend(s)}
            style={{
              flexShrink: 0,
              padding: '5px 12px',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              background: 'var(--bg-card)',
              color: 'var(--fg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 2,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'border-color 0.15s, color 0.15s',
            }}
            onMouseEnter={e => {
              (e.target as HTMLElement).style.borderColor = 'var(--brand-border)';
              (e.target as HTMLElement).style.color = 'var(--fg-primary)';
            }}
            onMouseLeave={e => {
              (e.target as HTMLElement).style.borderColor = 'var(--border)';
              (e.target as HTMLElement).style.color = 'var(--fg-secondary)';
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* ── Input ── */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'var(--bg-elevated)',
      }}>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 4,
          padding: '8px 12px',
          gap: 8,
        }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Decime qué auto buscás..."
            style={{ flex: 1, fontSize: 13, background: 'transparent', color: 'var(--fg-primary)', border: 'none', outline: 'none' }}
          />
          {input && (
            <button onClick={() => setInput('')} style={{ color: 'var(--fg-tertiary)', cursor: 'pointer', background: 'none', border: 'none', display: 'flex' }}>
              <X size={13} />
            </button>
          )}
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleSend()}
          disabled={!input.trim() || isLoading}
          style={{
            width: 36, height: 36,
            background: input.trim() ? 'var(--brand)' : 'var(--bg-card)',
            border: `1px solid ${input.trim() ? 'transparent' : 'var(--border)'}`,
            borderRadius: 4,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: input.trim() ? '#fff' : 'var(--fg-tertiary)',
            cursor: input.trim() ? 'pointer' : 'default',
            transition: 'background 0.15s, border-color 0.15s',
            flexShrink: 0,
          }}
        >
          <Send size={13} />
        </motion.button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
