'use client';

import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, Car, MessageSquare, Shield, HelpCircle, Check, ArrowDown, Camera, CreditCard, Send } from 'lucide-react';
import CarCard from '@/components/CarCard';
import AIChat from '@/components/AIChat';
import ReservaModal from '@/components/ReservaModal';
import VehicleDetailModal from '@/components/VehicleDetailModal';
import { VEHICLES, type Vehicle, type BodyType } from '@/data/vehicles';
import { formatARS } from '@/utils/currency';

const MAX_PRICE = 60_000_000;
const MIN_PRICE = 15_000_000;

const BRANDS = ['all', 'Toyota', 'Volkswagen', 'Ford', 'Chevrolet', 'Fiat', 'Peugeot', 'Renault'];
const YEARS = ['all', '2024', '2023'];
const CONDITIONS = [
  { label: 'Todos', value: 'all' },
  { label: '0 km', value: '0km' },
  { label: 'Usados', value: 'Usado' },
];

export default function Home() {
  // Estados de filtros manuales (Sidebar izquierdo)
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [activeType, setActiveType] = useState<BodyType | 'all'>('all');

  // Estados de control de la IA (Agentic UI)
  const [agentTypes, setAgentTypes] = useState<string[]>([]);
  const [agentMaxPrice, setAgentMaxPrice] = useState<number | undefined>(undefined);
  const [agentActive, setAgentActive] = useState(false);

  // Estados de Modales e Interfaz
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [bookingVehicle, setBookingVehicle] = useState<Vehicle | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const catalogRef = useRef<HTMLDivElement>(null);

  const handleAgentFilter = (bodyTypes: string[], price?: number) => {
    setAgentTypes(bodyTypes);
    setAgentMaxPrice(price);
    setAgentActive(true);
  };

  const clearAgentFilter = () => {
    setAgentActive(false);
    setAgentTypes([]);
    setAgentMaxPrice(undefined);
  };

  // Filtrado final de vehículos
  const filtered = useMemo(() => {
    return VEHICLES.filter(v => {
      const matchSearch =
        v.brand.toLowerCase().includes(search.toLowerCase()) ||
        v.model.toLowerCase().includes(search.toLowerCase()) ||
        v.version.toLowerCase().includes(search.toLowerCase());

      const matchBrand = selectedBrand === 'all' || v.brand === selectedBrand;
      const matchYear = selectedYear === 'all' || v.year.toString() === selectedYear;
      const matchCondition = selectedCondition === 'all' || v.condition === selectedCondition;
      
      const matchType = agentActive && agentTypes.length > 0
        ? agentTypes.includes(v.body_type)
        : activeType === 'all' || v.body_type === activeType;

      const priceLimit = agentActive && agentMaxPrice !== undefined ? agentMaxPrice : maxPrice;

      return matchSearch && matchBrand && matchYear && matchCondition && matchType && v.precio_ars <= priceLimit;
    });
  }, [search, selectedBrand, selectedYear, selectedCondition, activeType, maxPrice, agentTypes, agentMaxPrice, agentActive]);

  const scrollToCatalog = () => {
    catalogRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const triggerVenderFlow = () => {
    setIsChatOpen(true);
    setTimeout(() => {
      const inputEl = document.querySelector('input[placeholder*="Escribile"]') as HTMLInputElement;
      if (inputEl) {
        inputEl.value = 'Quiero tasar mi auto usado';
        inputEl.focus();
      }
    }, 500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-base)', overflow: 'hidden' }}>

      {/* ══ HEADER PRINCIPAL ══════════════════════════════════ */}
      <header style={{
        height: 64,
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        padding: '0 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        zIndex: 10,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--fg-primary)' }}>AUTO</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--brand)' }}>YA</span>
          <span style={{ marginLeft: 10, fontSize: 9, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--fg-tertiary)' }}>Portal Oficial</span>
        </div>

        {/* Global Search Bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          borderRadius: 4, padding: '8px 14px', width: 340,
        }}>
          <Search size={14} style={{ color: 'var(--fg-tertiary)' }} />
          <input
            type="text"
            placeholder="Buscar por marca, modelo o versión..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, fontSize: 13, background: 'transparent', color: 'var(--fg-primary)', border: 'none', outline: 'none' }}
          />
          {search && <X size={14} onClick={() => setSearch('')} style={{ color: 'var(--fg-tertiary)', cursor: 'pointer' }} />}
        </div>

        {/* Contact/Status info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ textAlign: 'right' }} className="hidden md:block">
            <p style={{ fontSize: 10, color: 'var(--fg-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Asistencia Directa</p>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg-primary)', marginTop: 2 }}>0810-333-2886</p>
          </div>

          {/* Floating AI Agent Trigger */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 18px',
              background: 'var(--brand-dim)',
              border: '1px solid var(--brand-border)',
              borderRadius: 3, cursor: 'pointer',
              color: 'var(--brand)', fontSize: 11, fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              boxShadow: '0 0 16px var(--brand-glow)',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
            Asesor Premium
          </button>
        </div>
      </header>

      {/* Main content viewport */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

        {/* ══ HERO SECTION (Comprar / Vender CTAs gigantes) ═════ */}
        <section style={{
          position: 'relative',
          padding: '64px 28px',
          background: 'linear-gradient(135deg, #09090b 40%, #1c0a0c 100%)',
          borderBottom: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        }}>
          <div style={{ maxWidth: 800, zIndex: 2, marginBottom: 36 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.25em',
              textTransform: 'uppercase', color: 'var(--brand)',
              background: 'rgba(224,34,50,0.1)', border: '1px solid rgba(224,34,50,0.2)',
              padding: '4px 12px', borderRadius: 2,
            }}>
              AutoYa Agentic Portal
            </span>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: 44, fontWeight: 800,
              letterSpacing: '-0.03em', lineHeight: 1.1, marginTop: 18,
              color: 'var(--fg-primary)',
            }}>
              La nueva forma de comerciar vehículos con Inteligencia Artificial.
            </h1>
            <p style={{ fontSize: 14, color: 'var(--fg-secondary)', marginTop: 14, lineHeight: 1.6, maxWidth: 640, marginInline: 'auto' }}>
              Navegue en nuestro catálogo digital premium o solicite la asistencia del Asesor de IA en tiempo real para cotizar, financiar y señar su unidad al instante.
            </p>
          </div>

          {/* TWO GIANT CTAS (Car One Structure) */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 20, width: '100%', maxWidth: 740, zIndex: 2,
          }} className="flex flex-col sm:flex-row gap-6 w-full">
            
            {/* CTA 1: COMPRAR */}
            <motion.button
              whileHover={{ scale: 1.02, border: '1px solid var(--brand-border)', boxShadow: '0 0 30px var(--brand-glow)' }}
              whileTap={{ scale: 0.98 }}
              onClick={scrollToCatalog}
              style={{
                background: 'linear-gradient(180deg, #18181b, #09090b)',
                border: '1px solid var(--border)',
                borderRadius: 6, padding: '32px 24px',
                textAlign: 'left', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', gap: 8,
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 4, background: 'var(--brand-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)' }}>
                <Car size={18} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--fg-primary)', marginTop: 8 }}>
                Comprar un Vehículo
              </h3>
              <p style={{ fontSize: 12, color: 'var(--fg-secondary)', lineHeight: 1.5 }}>
                Explore nuestro stock verificado de unidades 0km y usados con garantía.
              </p>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand)', marginTop: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                Ver catálogo &darr;
              </span>
            </motion.button>

            {/* CTA 2: VENDER */}
            <motion.button
              whileHover={{ scale: 1.02, border: '1px solid var(--brand-border)', boxShadow: '0 0 30px var(--brand-glow)' }}
              whileTap={{ scale: 0.98 }}
              onClick={triggerVenderFlow}
              style={{
                background: 'linear-gradient(180deg, #18181b, #09090b)',
                border: '1px solid var(--border)',
                borderRadius: 6, padding: '32px 24px',
                textAlign: 'left', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', gap: 8,
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 4, background: 'var(--brand-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)' }}>
                <Camera size={18} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--fg-primary)', marginTop: 8 }}>
                Vender mi Vehículo
              </h3>
              <p style={{ fontSize: 12, color: 'var(--fg-secondary)', lineHeight: 1.5 }}>
                Tase su auto al instante cargando una fotografía para nuestro tasador visual de IA.
              </p>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand)', marginTop: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                Iniciar tasación &rarr;
              </span>
            </motion.button>
          </div>
        </section>

        {/* ══ WEB PORTAL LAYOUT: FILTROS SIDEBAR + GRILLA CENTRAL ══ */}
        <div ref={catalogRef} style={{
          display: 'flex', flex: 1, minHeight: '600px',
          background: 'var(--bg-base)',
        }}>
          
          {/* SIDEBAR IZQUIERDO: FILTROS ESTÁTICOS COMPLETOS */}
          <aside style={{
            width: 260, flexShrink: 0,
            borderRight: '1px solid var(--border)',
            background: 'var(--bg-surface)',
            padding: '24px 20px',
            display: 'flex', flexDirection: 'column', gap: 24,
          }} className="hidden md:flex">
            
            <div>
              <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg-primary)', marginBottom: 14 }}>
                Filtros Rápidos
              </h3>
              <div style={{ height: 1, background: 'var(--border)' }} />
            </div>

            {/* Condición / Tipo */}
            <div>
              <span style={{ fontSize: 10, color: 'var(--fg-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 10, fontWeight: 600 }}>
                Condición
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {CONDITIONS.map(cond => (
                  <label key={cond.value} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--fg-secondary)', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="condition"
                      checked={selectedCondition === cond.value}
                      onChange={() => setSelectedCondition(cond.value)}
                      style={{ accentColor: 'var(--brand)' }}
                    />
                    {cond.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Marca */}
            <div>
              <span style={{ fontSize: 10, color: 'var(--fg-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 10, fontWeight: 600 }}>
                Marca
              </span>
              <select
                value={selectedBrand}
                onChange={e => setSelectedBrand(e.target.value)}
                style={{
                  width: '100%', padding: '8px 10px',
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 3, fontSize: 12, color: 'var(--fg-primary)',
                }}
              >
                <option value="all">Todas las marcas</option>
                {BRANDS.slice(1).map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Año */}
            <div>
              <span style={{ fontSize: 10, color: 'var(--fg-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 10, fontWeight: 600 }}>
                Año
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                {YEARS.map(y => (
                  <button
                    key={y}
                    onClick={() => setSelectedYear(y)}
                    style={{
                      flex: 1, padding: '6px 0', borderRadius: 3,
                      background: selectedYear === y ? 'var(--brand-dim)' : 'var(--bg-elevated)',
                      border: `1px solid ${selectedYear === y ? 'var(--brand-border)' : 'var(--border)'}`,
                      color: selectedYear === y ? 'var(--brand)' : 'var(--fg-secondary)',
                      fontSize: 11, fontWeight: 700, cursor: 'pointer',
                    }}
                  >
                    {y === 'all' ? 'Todos' : y}
                  </button>
                ))}
              </div>
            </div>

            {/* Segmento / Carrocería */}
            <div>
              <span style={{ fontSize: 10, color: 'var(--fg-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 10, fontWeight: 600 }}>
                Carrocería
              </span>
              <select
                value={activeType}
                onChange={e => { setActiveType(e.target.value as any); clearAgentFilter(); }}
                style={{
                  width: '100%', padding: '8px 10px',
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 3, fontSize: 12, color: 'var(--fg-primary)',
                }}
              >
                <option value="all">Todas las carrocerías</option>
                <option value="sedan">Sedán</option>
                <option value="hatchback">Hatchback</option>
                <option value="suv">SUV</option>
                <option value="pickup">Pickup</option>
              </select>
            </div>

            {/* Rango de Precios */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 10, color: 'var(--fg-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Precio Máximo</span>
                <strong style={{ fontSize: 11, color: 'var(--fg-primary)' }}>{formatARS(maxPrice)}</strong>
              </div>
              <input
                type="range"
                min={MIN_PRICE}
                max={MAX_PRICE}
                step={500_000}
                value={maxPrice}
                onChange={e => { setMaxPrice(Number(e.target.value)); clearAgentFilter(); }}
                style={{ width: '100%' }}
              />
            </div>

            <button
              onClick={() => {
                setSearch(''); setSelectedBrand('all'); setSelectedYear('all');
                setSelectedCondition('all'); setMaxPrice(MAX_PRICE); setActiveType('all');
                clearAgentFilter();
              }}
              style={{
                width: '100%', padding: '10px', marginTop: 12,
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                color: 'var(--fg-secondary)', borderRadius: 3, fontSize: 11,
                fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                cursor: 'pointer',
              }}
            >
              Limpiar filtros
            </button>
          </aside>

          {/* GRILLA CENTRAL: VEHICLE GRID PRINCIPAL */}
          <section style={{ flex: 1, padding: '28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--fg-primary)' }}>
                  Vehículos Disponibles
                </h2>
                <p style={{ fontSize: 12, color: 'var(--fg-tertiary)', marginTop: 2 }}>
                  {filtered.length} unidad{filtered.length !== 1 ? 'es' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Indicator of AI control */}
              {agentActive && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  background: 'var(--ai-dim)', border: '1px solid var(--ai-border)',
                  borderRadius: 3, color: 'var(--ai)',
                }}>
                  <SlidersHorizontal size={10} />
                  Filtro de Asesor IA Activo
                  <button onClick={clearAgentFilter} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', padding: 2 }}>
                    <X size={10} />
                  </button>
                </div>
              )}
            </div>

            {/* Vehicle Grid */}
            {filtered.length === 0 ? (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '80px 0', gap: 12, color: 'var(--fg-tertiary)',
              }}>
                <Car size={40} strokeWidth={1} />
                <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--fg-secondary)' }}>Sin resultados de búsqueda</p>
                <p style={{ fontSize: 12 }}>Intente suavizar sus criterios o consulte a nuestro Asesor Premium.</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 20,
              }}>
                {filtered.map((v, i) => (
                  <CarCard key={v.id} vehicle={v} index={i} onSelect={setSelectedVehicle} />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* ══ FOOTER COMPLETO ══════════════════════════════════ */}
        <footer style={{
          background: 'var(--bg-card)',
          borderTop: '1px solid var(--border)',
          padding: '40px 28px',
          display: 'flex', flexDirection: 'column', gap: 24,
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 24,
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 12 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--fg-primary)' }}>AUTO</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--brand)' }}>YA</span>
              </div>
              <p style={{ fontSize: 11, color: 'var(--fg-tertiary)', lineHeight: 1.6 }}>
                Portal líder de comercio automotriz con integración de IA generativa y OCR documental.
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg-primary)', marginBottom: 12 }}>Oficinas de Ventas</h4>
              <p style={{ fontSize: 11, color: 'var(--fg-secondary)', lineHeight: 1.6 }}>
                📍 Av. del Libertador 12500, San Isidro, GBA<br />
                📍 Av. Scalabrini Ortiz 3200, Palermo, CABA
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg-primary)', marginBottom: 12 }}>Atención y Canales</h4>
              <p style={{ fontSize: 11, color: 'var(--fg-secondary)', lineHeight: 1.6 }}>
                📞 0810-333-AUTOYA (2886)<br />
                ✉️ info@autoya.com.ar<br />
                Lunes a Sábados: 09:00 a 19:00 hs.
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg-primary)', marginBottom: 12 }}>Marco Legal</h4>
              <p style={{ fontSize: 11, color: 'var(--fg-tertiary)', lineHeight: 1.5 }}>
                Precios informados en pesos argentinos. Reservas sujetas a verificación registral DNRPA. AutoYa © {new Date().getFullYear()}.
              </p>
            </div>
          </div>

          <div style={{
            borderTop: '1px solid var(--border)',
            paddingTop: 16,
            textAlign: 'center',
            fontSize: 10, color: 'var(--fg-tertiary)',
          }}>
            AutoYa Concesionario Oficial · Todos los derechos reservados.
          </div>
        </footer>

      </div>

      {/* ══ FLOATING ASESOR IA SIDE-SHEET (Glow overlay from right) ══ */}
      <AnimatePresence>
        {isChatOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsChatOpen(false)}
              style={{
                position: 'fixed', inset: 0,
                background: '#000', zIndex: 30,
              }}
            />
            {/* Side-sheet panel */}
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              style={{
                position: 'fixed', right: 0, top: 0, bottom: 0,
                width: '100%', maxWidth: 360,
                background: 'var(--bg-surface)',
                borderLeft: '1px solid var(--border)',
                zIndex: 35,
                boxShadow: '-10px 0 40px rgba(0,0,0,0.5)',
                display: 'flex', flexDirection: 'column',
              }}
            >
              {/* Header inside Side-sheet */}
              <div style={{
                padding: '14px 20px',
                borderBottom: '1px solid var(--border)',
                background: 'var(--bg-elevated)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-primary)' }}>
                    Asesor de IA Premium
                  </span>
                </div>
                <button
                  onClick={() => setIsChatOpen(false)}
                  style={{
                    background: 'none', border: 'none', color: 'var(--fg-secondary)', cursor: 'pointer',
                    display: 'flex', padding: 4,
                  }}
                >
                  <X size={16} />
                </button>
              </div>
              
              {/* Chat View */}
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <AIChat onAgentFilter={handleAgentFilter} onReservar={(v) => { setSelectedVehicle(v); setBookingVehicle(v); }} />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Floating trigger button when sidebar is closed */}
      <AnimatePresence>
        {!isChatOpen && (
          <motion.button
            initial={{ scale: 0, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, y: 50 }}
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px var(--brand-glow)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsChatOpen(true)}
            style={{
              position: 'fixed', right: 28, bottom: 28,
              width: 56, height: 56, borderRadius: '50%',
              background: 'var(--brand)', color: '#fff',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 32px var(--brand-glow)',
              zIndex: 25,
            }}
            title="Abrir Asesor Premium"
          >
            <MessageSquare size={22} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ══ MODALES ════════════════════════════════════════ */}
      {selectedVehicle && (
        <VehicleDetailModal
          vehicle={selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
          onReservar={() => {
            setBookingVehicle(selectedVehicle);
          }}
        />
      )}

      {bookingVehicle && (
        <ReservaModal
          vehicle={bookingVehicle}
          onClose={() => setBookingVehicle(null)}
        />
      )}
    </div>
  );
}
