'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, Car } from 'lucide-react';
import CarCard from '@/components/CarCard';
import AIChat from '@/components/AIChat';
import ReservaModal from '@/components/ReservaModal';
import VehicleDetailModal from '@/components/VehicleDetailModal';
import { VEHICLES, type Vehicle, type BodyType } from '@/data/vehicles';
import { formatARS } from '@/utils/currency';

const FILTERS: { label: string; value: BodyType | 'all' }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Sedanes', value: 'sedan' },
  { label: 'Hatchbacks', value: 'hatchback' },
  { label: 'SUV / Crossover', value: 'suv' },
  { label: 'Pickups / 4x4', value: 'pickup' },
];

const MAX_PRICE = 60_000_000;
const MIN_PRICE = 15_000_000;

const BRANDS = [
  { name: 'Todas', value: 'all' },
  { name: 'Toyota', value: 'Toyota' },
  { name: 'Volkswagen', value: 'Volkswagen' },
  { name: 'Ford', value: 'Ford' },
  { name: 'Chevrolet', value: 'Chevrolet' },
  { name: 'Fiat', value: 'Fiat' },
  { name: 'Peugeot', value: 'Peugeot' },
  { name: 'Renault', value: 'Renault' },
];

export default function Home() {
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState<BodyType | 'all'>('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  
  const [agentTypes, setAgentTypes] = useState<string[]>([]);
  const [agentMaxPrice, setAgentMaxPrice] = useState<number | undefined>(undefined);
  const [agentActive, setAgentActive] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [bookingVehicle, setBookingVehicle] = useState<Vehicle | null>(null);

  const [isChatOpen, setIsChatOpen] = useState(true);

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

  const filtered = useMemo(() => {
    return VEHICLES.filter(v => {
      const matchSearch =
        v.brand.toLowerCase().includes(search.toLowerCase()) ||
        v.model.toLowerCase().includes(search.toLowerCase());
      
      const matchType = agentActive && agentTypes.length > 0
        ? agentTypes.includes(v.body_type)
        : activeType === 'all' || v.body_type === activeType;

      const matchBrand = selectedBrand === 'all' || v.brand === selectedBrand;

      const priceLimit = agentActive && agentMaxPrice !== undefined ? agentMaxPrice : maxPrice;
      
      return matchSearch && matchType && matchBrand && v.precio_ars <= priceLimit;
    });
  }, [search, activeType, selectedBrand, maxPrice, agentTypes, agentMaxPrice, agentActive]);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-base)' }}>

      <AnimatePresence initial={false}>
        {isChatOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 340, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: '1px solid var(--border)' }}
          >
            <AIChat onAgentFilter={handleAgentFilter} onReservar={(v) => { setSelectedVehicle(v); setBookingVehicle(v); }} />
          </motion.aside>
        )}
      </AnimatePresence>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        <header style={{
          flexShrink: 0,
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border)',
          padding: '0 28px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 12px',
                background: isChatOpen ? 'var(--brand-dim)' : 'var(--bg-elevated)',
                border: `1px solid ${isChatOpen ? 'var(--brand-border)' : 'var(--border)'}`,
                color: isChatOpen ? 'var(--brand)' : 'var(--fg-secondary)',
                borderRadius: 3, cursor: 'pointer', fontSize: 10, fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                transition: 'all 0.15s',
              }}
              title={isChatOpen ? 'Cerrar Asesor' : 'Abrir Asesor'}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              Asesor Premium
            </button>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--fg-primary)' }}>AUTO</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--brand)' }}>YA</span>
              <span style={{ marginLeft: 10, fontSize: 9, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--fg-tertiary)' }}>Portal Oficial</span>
            </div>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            padding: '8px 14px',
            flex: '0 0 280px',
            transition: 'border-color 0.2s',
          }}>
            <Search size={14} style={{ color: 'var(--fg-tertiary)', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Buscar marca o modelo..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, fontSize: 13, background: 'transparent', color: 'var(--fg-primary)', border: 'none', outline: 'none' }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ color: 'var(--fg-tertiary)', cursor: 'pointer', background: 'none', border: 'none', display: 'flex' }}>
                <X size={12} />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }} className="hidden lg:flex">
            {[
              { label: 'En stock', value: VEHICLES.length },
              { label: '0 km', value: VEHICLES.filter(v => v.condition === '0km').length },
              { label: 'Usados', value: VEHICLES.filter(v => v.condition === 'Usado').length },
            ].map(({ label, value }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--fg-primary)', lineHeight: 1 }}>{value}</p>
                <p style={{ fontSize: 9, color: 'var(--fg-tertiary)', marginTop: 2, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</p>
              </div>
            ))}
          </div>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <section style={{
            position: 'relative',
            padding: '48px 28px',
            background: 'linear-gradient(135deg, #09090b 20%, #1c0a0c 100%)',
            borderBottom: '1px solid var(--border)',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', right: '-10%', bottom: '-20%',
              width: '400px', height: '400px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(224,34,50,0.08) 0%, transparent 70%)',
              filter: 'blur(40px)', pointerEvents: 'none',
            }} />

            <div style={{ maxWidth: 700, position: 'relative', zIndex: 2 }}>
              <span style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '0.25em',
                textTransform: 'uppercase', color: 'var(--brand)',
                background: 'rgba(224,34,50,0.1)', border: '1px solid rgba(224,34,50,0.2)',
                padding: '4px 10px', borderRadius: 2,
              }}>
                Experiencia Automotriz de Próxima Generación
              </span>
              <h1 style={{
                fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800,
                letterSpacing: '-0.03em', lineHeight: 1.15, marginTop: 16,
                color: 'var(--fg-primary)',
              }}>
                Encuentre su próximo vehículo con el estándar de excelencia <span style={{ color: 'var(--brand)' }}>AutoYa</span>.
              </h1>
              <p style={{ fontSize: 13, color: 'var(--fg-secondary)', marginTop: 12, lineHeight: 1.6, maxWidth: 580 }}>
                Garantía oficial certificada, simulación de financiación en pesos con tasa fija e informes de tasación inmediatos asistidos por visión computacional.
              </p>
            </div>
          </section>

          <section style={{
            padding: '20px 28px',
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            <p style={{ fontSize: 10, color: 'var(--fg-tertiary)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600 }}>
              Filtrar por marcas destacadas
            </p>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {BRANDS.map(b => {
                const isSelected = selectedBrand === b.value;
                return (
                  <button
                    key={b.value}
                    onClick={() => setSelectedBrand(b.value)}
                    style={{
                      flexShrink: 0, padding: '10px 18px',
                      borderRadius: 3,
                      background: isSelected ? 'var(--brand-dim)' : 'var(--bg-card)',
                      border: `1px solid ${isSelected ? 'var(--brand-border)' : 'var(--border)'}`,
                      color: isSelected ? 'var(--brand)' : 'var(--fg-secondary)',
                      fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {b.name}
                  </button>
                );
              })}
            </div>
          </section>

          <section style={{
            padding: '24px 28px',
            background: 'var(--bg-base)',
            borderBottom: '1px solid var(--border)',
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 16,
          }}>
            {[
              {
                title: 'Simulación de Financiación',
                desc: 'Consulte planes de pago hasta en 48 cuotas fijas en pesos argentinos con sistema francés.',
                badge: 'Tasa Fija',
                action: 'Simular cuotas',
              },
              {
                title: 'Tasación por Inteligencia Artificial',
                desc: 'Adjunte una fotografía de su vehículo usado y nuestro tasador virtual emitirá una cotización de referencia en segundos.',
                badge: 'Multimodal',
                action: 'Tasar mi usado',
              },
              {
                title: 'Módulo GovTech & DNRPA',
                desc: 'Gestione su documentación digitalmente. Tablero de transferencias integrado con validación de identidad OCR.',
                badge: 'Seguro',
                action: 'Ir a Intranet',
                url: '/admin/transferencias',
              },
            ].map(card => (
              <div key={card.title} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 4, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: 8, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                    padding: '2px 6px', background: 'rgba(255,255,255,0.05)', borderRadius: 2,
                    color: 'var(--fg-secondary)',
                  }}>{card.badge}</span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--fg-primary)' }}>{card.title}</h3>
                <p style={{ fontSize: 11, color: 'var(--fg-secondary)', lineHeight: 1.5, flex: 1 }}>{card.desc}</p>
                {card.url ? (
                  <a href={card.url} style={{
                    fontSize: 11, fontWeight: 600, color: 'var(--brand)',
                    textDecoration: 'none', marginTop: 4, display: 'inline-block',
                  }}>
                    {card.action} &rarr;
                  </a>
                ) : (
                  <button
                    onClick={() => {
                      setIsChatOpen(true);
                      setTimeout(() => {
                        const inpt = document.querySelector('input[placeholder*="Escribile"]') as HTMLInputElement;
                        if (inpt) {
                          inpt.value = card.title.includes('Financiación') ? 'Quiero financiar un auto' : 'Quiero tasar mi auto';
                          inpt.focus();
                        }
                      }, 400);
                    }}
                    style={{
                      fontSize: 11, fontWeight: 600, color: 'var(--brand)',
                      background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                      marginTop: 4, padding: 0,
                    }}
                  >
                    {card.action} &rarr;
                  </button>
                )}
              </div>
            ))}
          </section>

          <section style={{ padding: '24px 28px', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {FILTERS.map(f => {
                  const isActive = !agentActive && activeType === f.value;
                  return (
                    <button
                      key={f.value}
                      onClick={() => { setActiveType(f.value); clearAgentFilter(); }}
                      style={{
                        padding: '6px 14px',
                        fontSize: 10, fontWeight: 700,
                        letterSpacing: '0.08em', textTransform: 'uppercase',
                        background: isActive ? 'var(--brand)' : 'var(--bg-elevated)',
                        color: isActive ? '#fff' : 'var(--fg-secondary)',
                        border: `1px solid ${isActive ? 'transparent' : 'var(--border)'}`,
                        borderRadius: 3, cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>

              {agentActive && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  background: 'var(--ai-dim)', border: '1px solid var(--ai-border)',
                  borderRadius: 3, color: 'var(--ai)',
                }}>
                  <SlidersHorizontal size={10} />
                  Filtro Inteligente Activo
                  <button onClick={clearAgentFilter} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', padding: 2 }}>
                    <X size={10} />
                  </button>
                </div>
              )}

              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--fg-tertiary)' }}>
                  Hasta: <strong style={{ color: 'var(--fg-primary)' }}>{formatARS(maxPrice)}</strong>
                </span>
                <input
                  type="range"
                  min={MIN_PRICE}
                  max={MAX_PRICE}
                  step={500_000}
                  value={maxPrice}
                  onChange={e => { setMaxPrice(Number(e.target.value)); clearAgentFilter(); }}
                  style={{ width: 100 }}
                />
              </div>
            </div>

            {filtered.length === 0 ? (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '48px 0', gap: 12, color: 'var(--fg-tertiary)',
              }}>
                <Car size={36} strokeWidth={1.5} />
                <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg-secondary)' }}>No se encontraron unidades</p>
                <p style={{ fontSize: 12 }}>Ajuste los filtros o solicite asistencia al Asesor Premium.</p>
                <button
                  onClick={() => { setSearch(''); setActiveType('all'); setSelectedBrand('all'); clearAgentFilter(); setMaxPrice(MAX_PRICE); }}
                  style={{
                    padding: '8px 18px',
                    background: 'var(--brand)', color: '#fff',
                    border: 'none', borderRadius: 3,
                    fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase',
                    cursor: 'pointer', marginTop: 6,
                  }}
                >
                  Reiniciar filtros
                </button>
              </div>
            ) : (
              <>
                <p style={{ fontSize: 11, color: 'var(--fg-tertiary)', letterSpacing: '0.05em' }}>
                  {filtered.length} unidad{filtered.length !== 1 ? 'es' : ''} disponible{filtered.length !== 1 ? 's' : ''}
                </p>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                  gap: 16,
                }}>
                  {filtered.map((v, i) => (
                    <CarCard key={v.id} vehicle={v} index={i} onSelect={setSelectedVehicle} />
                  ))}
                </div>
              </>
            )}
          </section>

          <footer style={{
            background: 'var(--bg-card)',
            borderTop: '1px solid var(--border)',
            padding: '40px 28px',
            marginTop: 'auto',
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
                  Plataforma líder en comercialización automotriz con Inteligencia Artificial.
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg-primary)', marginBottom: 12 }}>Nuestras Sucursales</h4>
                <p style={{ fontSize: 11, color: 'var(--fg-secondary)', lineHeight: 1.6 }}>
                  📍 Av. del Libertador 12500, San Isidro, GBA<br />
                  📍 Av. Scalabrini Ortiz 3200, Palermo, CABA
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg-primary)', marginBottom: 12 }}>Contacto & Horarios</h4>
                <p style={{ fontSize: 11, color: 'var(--fg-secondary)', lineHeight: 1.6 }}>
                  📞 0810-333-AUTOYA (2886)<br />
                  ✉️ info@autoya.com.ar<br />
                  Lunes a Sábados: 09:00 a 19:00 hs.
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg-primary)', marginBottom: 12 }}>Legales</h4>
                <p style={{ fontSize: 11, color: 'var(--fg-tertiary)', lineHeight: 1.5 }}>
                  Los precios expresados corresponden a las unidades publicadas en pesos argentinos. Sujeto a stock y aprobación crediticia. AutoYa © {new Date().getFullYear()}.
                </p>
              </div>
            </div>

            <div style={{
              borderTop: '1px solid var(--border)',
              paddingTop: 16,
              textAlign: 'center',
              fontSize: 10, color: 'var(--fg-tertiary)',
            }}>
              AutoYa Concesionario Oficial · Desarrollado bajo estándares de máxima calidad y latencia cero.
            </div>
          </footer>
        </div>
      </main>

      {/* Vehicle Details Modal */}
      {selectedVehicle && (
        <VehicleDetailModal
          vehicle={selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
          onReservar={() => {
            setBookingVehicle(selectedVehicle);
          }}
        />
      )}

      {/* Reserva Modal */}
      {bookingVehicle && (
        <ReservaModal
          vehicle={bookingVehicle}
          onClose={() => setBookingVehicle(null)}
        />
      )}
    </div>
  );
}
