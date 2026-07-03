'use client';

import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, Car, MessageSquare, Shield, HelpCircle, Check, ArrowDown, Camera, CreditCard, Send, Percent, FileText, MapPin, Phone, Mail } from 'lucide-react';
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
  const [detailInitialTab, setDetailInitialTab] = useState<'ficha' | 'financiacion'>('ficha');
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleSelectVehicle = (vehicle: Vehicle) => {
    setDetailInitialTab('ficha');
    setSelectedVehicle(vehicle);
  };

  const handleSimulateVehicle = (vehicle: Vehicle) => {
    setDetailInitialTab('financiacion');
    setSelectedVehicle(vehicle);
  };

  const catalogRef = useRef<HTMLDivElement>(null);
  const financingRef = useRef<HTMLDivElement>(null);
  const sucursalesRef = useRef<HTMLDivElement>(null);

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

  const scrollToFinancing = () => {
    financingRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToSucursales = () => {
    sucursalesRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh', color: 'var(--fg-primary)', fontFamily: 'var(--font-sans)' }}>

      {/* ══ STICKY NAVBAR ══════════════════════════════════════ */}
      <nav style={{
        position: 'sticky', top: 0,
        height: 70,
        background: 'rgba(9,9,11,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 30,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--fg-primary)' }}>AUTO</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--brand)' }}>YA</span>
        </div>

        {/* Navigation Links */}
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }} className="hidden lg:flex">
          <button onClick={scrollToCatalog} style={{ background: 'none', border: 'none', color: 'var(--fg-secondary)', cursor: 'pointer', fontSize: 13, fontWeight: 600, letterSpacing: '0.05em' }} className="hover:text-[var(--brand)] transition-colors">
            COMPRAR
          </button>
          <button onClick={triggerVenderFlow} style={{ background: 'none', border: 'none', color: 'var(--fg-secondary)', cursor: 'pointer', fontSize: 13, fontWeight: 600, letterSpacing: '0.05em' }} className="hover:text-[var(--brand)] transition-colors">
            VENDER MI AUTO
          </button>
          <button onClick={scrollToFinancing} style={{ background: 'none', border: 'none', color: 'var(--fg-secondary)', cursor: 'pointer', fontSize: 13, fontWeight: 600, letterSpacing: '0.05em' }} className="hover:text-[var(--brand)] transition-colors">
            FINANCIACIÓN
          </button>
          <button onClick={scrollToSucursales} style={{ background: 'none', border: 'none', color: 'var(--fg-secondary)', cursor: 'pointer', fontSize: 13, fontWeight: 600, letterSpacing: '0.05em' }} className="hover:text-[var(--brand)] transition-colors">
            SUCURSALES
          </button>
          <a href="/admin" style={{ color: 'var(--fg-tertiary)', textDecoration: 'none', fontSize: 13, fontWeight: 600, letterSpacing: '0.05em' }} className="hover:text-[var(--brand)] transition-colors">
            GESTIÓN 08
          </a>
        </div>

        {/* Right CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
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
      </nav>

      {/* ══ HERO SECTION (Immersive & Large Banners) ═════════ */}
      <section style={{
        position: 'relative',
        padding: '120px 40px 100px',
        background: 'linear-gradient(135deg, #09090b 45%, #1d0c0e 100%)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        overflow: 'hidden',
      }}>
        {/* Glow behind content */}
        <div style={{
          position: 'absolute', right: '-15%', bottom: '-30%',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(224,34,50,0.06) 0%, transparent 70%)',
          filter: 'blur(50px)', pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 840, zIndex: 2, marginBottom: 54 }}>
          <span style={{
            fontSize: 11, fontWeight: 800, letterSpacing: '0.3em',
            textTransform: 'uppercase', color: 'var(--brand)',
            background: 'rgba(224,34,50,0.08)', border: '1px solid rgba(224,34,50,0.18)',
            padding: '6px 14px', borderRadius: 2,
          }}>
            TECNOLOGÍA AL SERVICIO DE TU MOVILIDAD
          </span>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: '3.2rem', fontWeight: 900,
            letterSpacing: '-0.03em', lineHeight: 1.1, marginTop: 24,
            color: 'var(--fg-primary)',
          }}>
            El portal automotriz líder, asistido de principio a fin por <span style={{ color: 'var(--brand)' }}>Inteligencia Artificial</span>.
          </h1>
          <p style={{ fontSize: 16, color: 'var(--fg-secondary)', marginTop: 20, lineHeight: 1.6, maxWidth: 680, marginInline: 'auto' }}>
            Navegue por el inventario premium, simule su financiación de tasa fija o realice la tasación por visión computacional de su unidad usada de forma 100% digital.
          </p>
        </div>

        {/* TWO GIANT CTAS (Car One Hero Clone) */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 24, width: '100%', maxWidth: 800, zIndex: 2,
        }}>
          {/* CTA 1: COMPRAR */}
          <motion.div
            whileHover={{ y: -6, border: '1px solid var(--brand-border)', boxShadow: '0 12px 40px rgba(224,34,50,0.1)' }}
            transition={{ duration: 0.25 }}
            onClick={scrollToCatalog}
            style={{
              background: 'linear-gradient(180deg, #18181b, #09090b)',
              border: '1px solid var(--border)',
              borderRadius: 6, padding: '40px 32px',
              textAlign: 'left', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', gap: 12,
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 4, background: 'var(--brand-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)' }}>
              <Car size={22} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--fg-primary)', marginTop: 12 }}>
              Comprar un Vehículo
            </h3>
            <p style={{ fontSize: 13, color: 'var(--fg-secondary)', lineHeight: 1.6 }}>
              Encuentre autos nuevos o usados certificados con garantía y listos para transferir.
            </p>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand)', marginTop: 18, display: 'flex', alignItems: 'center', gap: 6 }}>
              Ver catálogo en stock &rarr;
            </span>
          </motion.div>

          {/* CTA 2: VENDER */}
          <motion.div
            whileHover={{ y: -6, border: '1px solid var(--brand-border)', boxShadow: '0 12px 40px rgba(224,34,50,0.1)' }}
            transition={{ duration: 0.25 }}
            onClick={triggerVenderFlow}
            style={{
              background: 'linear-gradient(180deg, #18181b, #09090b)',
              border: '1px solid var(--border)',
              borderRadius: 6, padding: '40px 32px',
              textAlign: 'left', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', gap: 12,
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 4, background: 'var(--brand-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)' }}>
              <Camera size={22} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--fg-primary)', marginTop: 12 }}>
              Vender mi Vehículo
            </h3>
            <p style={{ fontSize: 13, color: 'var(--fg-secondary)', lineHeight: 1.6 }}>
              Tase su vehículo usado con nuestro bot de visión inteligente cargando solo una foto.
            </p>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand)', marginTop: 18, display: 'flex', alignItems: 'center', gap: 6 }}>
              Iniciar cotización inmediata &rarr;
            </span>
          </motion.div>
        </div>
      </section>

      {/* ══ SECCIÓN DE MARCAS PRINCIPALES ══════════════════════ */}
      <section style={{
        padding: '60px 40px',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32,
      }}>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--fg-tertiary)' }}>ENCUENTRE SU MARCA FAVORITA</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginTop: 8, color: 'var(--fg-primary)' }}>
            Navegación por Fabricantes
          </h2>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: 16, width: '100%', maxWidth: 1000,
        }}>
          {BRANDS.map(brand => {
            const isSelected = selectedBrand === brand;
            const label = brand === 'all' ? 'Todas' : brand;
            return (
              <motion.button
                key={brand}
                whileHover={{ y: -4, borderColor: 'var(--brand-border)', background: 'var(--brand-dim)' }}
                onClick={() => {
                  setSelectedBrand(brand);
                  scrollToCatalog();
                }}
                style={{
                  padding: '24px 16px',
                  borderRadius: 4,
                  background: isSelected ? 'var(--brand-dim)' : 'var(--bg-card)',
                  border: `1px solid ${isSelected ? 'var(--brand-border)' : 'var(--border)'}`,
                  color: isSelected ? 'var(--brand)' : 'var(--fg-secondary)',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  textAlign: 'center', transition: 'all 0.15s',
                }}
              >
                {label}
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* ══ SECCIÓN: BENEFICIOS CORPORATIVOS & INFO ═══════════ */}
      <section style={{
        padding: '80px 40px',
        background: 'var(--bg-base)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', gap: 40,
      }}>
        <div style={{ textAlign: 'center', maxWidth: 600, marginInline: 'auto' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--fg-primary)' }}>
            ¿Por qué elegir AutoYa?
          </h2>
          <p style={{ fontSize: 14, color: 'var(--fg-secondary)', marginTop: 8 }}>
            Ofrecemos ventajas estructurales y tecnológicas que redefinen la compra y venta en Argentina.
          </p>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 24, width: '100%', maxWidth: 1000, marginInline: 'auto',
        }}>
          {[
            {
              icon: <Percent size={24} />,
              title: 'Financiación Tasa Fija',
              desc: 'Créditos prendarios en pesos bajo sistema francés. Financiación hasta el 80% de la unidad con plazos fijos de 12 a 48 meses.'
            },
            {
              icon: <Camera size={24} />,
              title: 'Tasación Inteligente Visión',
              desc: 'Nuestra tecnología analiza de forma objetiva la fotografía de su auto usado, computando la cotización óptima de mercado en segundos.'
            },
            {
              icon: <FileText size={24} />,
              title: 'Gestoría Digital Integrada',
              desc: 'Precarga automática de formularios de transferencia y DNI vía OCR para minimizar tiempos en el registro de propiedad automotor.'
            }
          ].map((item, idx) => (
            <div key={idx} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 4, padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 14,
            }}>
              <div style={{ color: 'var(--brand)', display: 'inline-block' }}>{item.icon}</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--fg-primary)' }}>{item.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--fg-secondary)', lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ CATALOGO COMPLETO (Sidebar filtros + Grilla central) ══ */}
      <section ref={catalogRef} style={{
        padding: '80px 40px',
        background: 'var(--bg-base)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: 1200, marginInline: 'auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--brand)' }}>INVENTARIO REAL DISPONIBLE</span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', marginTop: 8, color: 'var(--fg-primary)' }}>
                Catálogo de Unidades
              </h2>
            </div>
            
            {/* Search Input on top of grid */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: 4, padding: '10px 16px', width: 300,
            }}>
              <Search size={14} style={{ color: 'var(--fg-tertiary)' }} />
              <input
                type="text"
                placeholder="Buscar por marca o modelo..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ flex: 1, fontSize: 13, background: 'transparent', color: 'var(--fg-primary)', border: 'none', outline: 'none' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 32, flexDirection: 'row' }} className="flex-col md:flex-row">
            
            {/* SIDEBAR DE FILTROS ESTÁTICOS */}
            <aside style={{
              width: 260, flexShrink: 0,
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              borderRadius: 4, padding: '24px 20px',
              display: 'flex', flexDirection: 'column', gap: 24,
              alignSelf: 'flex-start',
            }}>
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg-primary)', marginBottom: 14 }}>
                  Filtros de Búsqueda
                </h3>
                <div style={{ height: 1, background: 'var(--border)' }} />
              </div>

              {/* Condición */}
              <div>
                <span style={{ fontSize: 10, color: 'var(--fg-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 10, fontWeight: 600 }}>
                  Condición
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {CONDITIONS.map(cond => (
                    <label key={cond.value} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--fg-secondary)', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="condition-sidebar"
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

              {/* Carrocería */}
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

            {/* GRILLA DE AUTOS */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: 12, color: 'var(--fg-tertiary)', letterSpacing: '0.05em' }}>
                  {filtered.length} unidad{filtered.length !== 1 ? 'es' : ''} disponible{filtered.length !== 1 ? 's' : ''}
                </p>

                {agentActive && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px', fontSize: 10, fontWeight: 700,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    background: 'var(--ai-dim)', border: '1px solid var(--ai-border)',
                    borderRadius: 3, color: 'var(--ai)',
                  }}>
                    <SlidersHorizontal size={10} />
                    Asistido por Asesor de IA
                    <button onClick={clearAgentFilter} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', padding: 2 }}>
                      <X size={10} />
                    </button>
                  </div>
                )}
              </div>

              {filtered.length === 0 ? (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  padding: '80px 0', gap: 12, color: 'var(--fg-tertiary)',
                  border: '1px dashed var(--border)', borderRadius: 4,
                }}>
                  <Car size={36} strokeWidth={1} />
                  <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg-secondary)' }}>No se encontraron unidades</p>
                  <p style={{ fontSize: 12 }}>Intente ajustar los filtros de búsqueda manuales o consulte al Asesor Premium.</p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(285px, 1fr))',
                  gap: 20,
                }}>
                  {filtered.map((v, i) => (
                    <CarCard
                      key={v.id}
                      vehicle={v}
                      index={i}
                      onSelect={handleSelectVehicle}
                      onSimulate={handleSimulateVehicle}
                    />
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      </section>

      {/* ══ SECCIÓN: FINANCIACIÓN EXCLUSIVA (Car One Simulator Section) ══ */}
      <section ref={financingRef} style={{
        padding: '80px 40px',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: 900, marginInline: 'auto', display: 'flex', flexDirection: 'column', gap: 32, alignItems: 'center', textAlign: 'center' }}>
          <div>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--brand)' }}>FINANCIACIÓN EN PESOS ARGENTINOS</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', marginTop: 8, color: 'var(--fg-primary)' }}>
              Acceda a su préstamo prendario en minutos
            </h2>
            <p style={{ fontSize: 14, color: 'var(--fg-secondary)', marginTop: 12, lineHeight: 1.6, maxWidth: 600, marginInline: 'auto' }}>
              AutoYa le permite simular y pre-aprobar su crédito de forma 100% digital. Seleccione cualquier vehículo de nuestro catálogo para calcular su cuota fija en el simulador incorporado.
            </p>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 24, width: '100%', marginTop: 16,
          }}>
            {[
              { title: 'Tasa Fija', value: 'TNA desde 65%', desc: 'Mantenga sus cuotas constantes durante toda la vigencia del contrato prendario.' },
              { title: 'Plazo Flexible', value: '12 a 48 Meses', desc: 'Elija el plazo que mejor se adapte a su planificación financiera personal.' },
              { title: 'Aprobación Online', value: 'Pre-Aprobado', desc: 'Reciba el dictamen preliminar del crédito en línea a través de la gestoría digital.' },
            ].map((p, idx) => (
              <div key={idx} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 4, padding: '24px 20px',
              }}>
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--fg-tertiary)' }}>{p.title}</span>
                <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--brand)', marginTop: 6, marginBottom: 8, fontFamily: 'var(--font-display)' }}>{p.value}</p>
                <p style={{ fontSize: 12, color: 'var(--fg-secondary)', lineHeight: 1.5 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SECCIÓN: SUCURSALES (Car One Style) ═══════════════ */}
      <section ref={sucursalesRef} style={{
        padding: '80px 40px',
        background: 'var(--bg-base)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: 1000, marginInline: 'auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--brand)' }}>ESTAMOS PARA ASISTIRLO</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', marginTop: 8, color: 'var(--fg-primary)' }}>
              Nuestras Concesionarias
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
            {[
              {
                suc: 'Sucursal San Isidro (Casa Central)',
                addr: '📍 Av. del Libertador 12500, San Isidro, GBA',
                hr: '📅 Lun a Sab de 09:00 a 19:00 hs',
                map: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80',
              },
              {
                suc: 'Sucursal Palermo (Centro de Entregas)',
                addr: '📍 Av. Scalabrini Ortiz 3200, Palermo, CABA',
                hr: '📅 Lun a Sab de 09:00 a 19:00 hs',
                map: 'https://images.unsplash.com/photo-1549576490-b0b4831ef60a?auto=format&fit=crop&w=600&q=80',
              }
            ].map((s, idx) => (
              <div key={idx} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 4, overflow: 'hidden',
              }}>
                <img src={s.map} alt={s.suc} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
                <div style={{ padding: '20px' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--fg-primary)' }}>{s.suc}</h3>
                  <p style={{ fontSize: 13, color: 'var(--fg-secondary)', marginTop: 8 }}>{s.addr}</p>
                  <p style={{ fontSize: 12, color: 'var(--fg-tertiary)', marginTop: 4 }}>{s.hr}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ RICH FOOTER CORPORATIVO ════════════════════════════ */}
      <footer style={{
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border)',
        padding: '60px 40px 40px',
      }}>
        <div style={{ maxWidth: 1100, marginInline: 'auto', display: 'flex', flexDirection: 'column', gap: 40 }}>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 32,
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 16 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--fg-primary)' }}>AUTO</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--brand)' }}>YA</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--fg-tertiary)', lineHeight: 1.6 }}>
                AutoYa Concesionario Oficial. Compra, venta y financiación prendaria en pesos argentinos con control de procesos de gestoría por Inteligencia Artificial.
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg-primary)', marginBottom: 16 }}>Menú Rápido</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12 }}>
                <span onClick={scrollToCatalog} style={{ color: 'var(--fg-secondary)', cursor: 'pointer' }} className="hover:text-[var(--brand)]">Catálogo Completo</span>
                <span onClick={triggerVenderFlow} style={{ color: 'var(--fg-secondary)', cursor: 'pointer' }} className="hover:text-[var(--brand)]">Tasar mi Auto</span>
                <span onClick={scrollToFinancing} style={{ color: 'var(--fg-secondary)', cursor: 'pointer' }} className="hover:text-[var(--brand)]">Planes de Financiación</span>
                <span onClick={scrollToSucursales} style={{ color: 'var(--fg-secondary)', cursor: 'pointer' }} className="hover:text-[var(--brand)]">Nuestras Sucursales</span>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg-primary)', marginBottom: 16 }}>Atención al Cliente</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 12, color: 'var(--fg-secondary)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Phone size={13} /> 0810-333-2886</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Mail size={13} /> info@autoya.com.ar</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><MapPin size={13} /> GBA & Capital Federal</span>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg-primary)', marginBottom: 16 }}>Legales</h4>
              <p style={{ fontSize: 12, color: 'var(--fg-tertiary)', lineHeight: 1.6 }}>
                Operaciones en pesos (ARS) de acuerdo a las reglamentaciones vigentes del Banco Central de la República Argentina y la Dirección Nacional de los Registros Nacionales de la Propiedad del Automóvil (DNRPA).
              </p>
            </div>
          </div>

          <div style={{
            borderTop: '1px solid var(--border)',
            paddingTop: 24,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16,
            fontSize: 11, color: 'var(--fg-tertiary)',
          }}>
            <span>AutoYa © {new Date().getFullYear()} · Portal Oficial. Todos los derechos reservados.</span>
            <span>Tasa Fija prendaria controlada de acuerdo a las políticas regulatorias vigentes.</span>
          </div>

        </div>
      </footer>

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
                background: '#000', zIndex: 40,
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
                zIndex: 45,
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
              zIndex: 35,
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
          initialTab={detailInitialTab}
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
