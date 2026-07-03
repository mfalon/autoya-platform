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

export default function Home() {
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState<BodyType | 'all'>('all');
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [agentTypes, setAgentTypes] = useState<string[]>([]);
  const [agentMaxPrice, setAgentMaxPrice] = useState<number | undefined>(undefined);
  const [agentActive, setAgentActive] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [bookingVehicle, setBookingVehicle] = useState<Vehicle | null>(null);

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

  const filtered = useMemo<Vehicle[]>(() => {
    return VEHICLES.filter(v => {
      const matchSearch =
        v.brand.toLowerCase().includes(search.toLowerCase()) ||
        v.model.toLowerCase().includes(search.toLowerCase()) ||
        v.version.toLowerCase().includes(search.toLowerCase());
      const matchType = agentActive && agentTypes.length > 0
        ? agentTypes.includes(v.body_type)
        : activeType === 'all' || v.body_type === activeType;
      const priceLimit = agentActive && agentMaxPrice !== undefined ? agentMaxPrice : maxPrice;
      return matchSearch && matchType && v.precio_ars <= priceLimit;
    });
  }, [search, activeType, maxPrice, agentTypes, agentMaxPrice, agentActive]);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-base)' }}>

      {/* ══ LEFT: AI Panel ══════════════════════════════════ */}
      <aside style={{ width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <AIChat onAgentFilter={handleAgentFilter} onReservar={(v) => { setSelectedVehicle(v); setBookingVehicle(v); }} />
      </aside>

      {/* ══ RIGHT: Catalog ══════════════════════════════════ */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* ── Top Bar ── */}
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
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: '-0.04em',
              color: 'var(--fg-primary)',
            }}>
              AUTO
            </span>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: '-0.04em',
              color: 'var(--brand)',
            }}>
              YA
            </span>
            <span style={{
              marginLeft: 10,
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--fg-tertiary)',
              alignSelf: 'center',
            }}>
              Multimarca · GBA
            </span>
          </div>

          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            padding: '8px 14px',
            flex: '0 0 280px',
            transition: 'border-color 0.2s',
          }}
            onFocus={() => {}}
          >
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

          {/* Stats */}
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            {[
              { label: 'En stock', value: VEHICLES.length },
              { label: '0 km', value: VEHICLES.filter(v => v.condition === '0km').length },
              { label: 'Usados', value: VEHICLES.filter(v => v.condition === 'Usado').length },
            ].map(({ label, value }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--fg-primary)', lineHeight: 1 }}>{value}</p>
                <p style={{ fontSize: 10, color: 'var(--fg-tertiary)', marginTop: 2, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</p>
              </div>
            ))}
          </div>
        </header>

        {/* ── Filter Bar ── */}
        <div style={{
          flexShrink: 0,
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border)',
          padding: '10px 28px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          {/* Type filters */}
          {FILTERS.map(f => {
            const isActive = !agentActive && activeType === f.value;
            return (
              <motion.button
                key={f.value}
                onClick={() => { setActiveType(f.value); clearAgentFilter(); }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  padding: '6px 14px',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  background: isActive ? 'var(--brand)' : 'var(--bg-elevated)',
                  color: isActive ? '#fff' : 'var(--fg-secondary)',
                  border: `1px solid ${isActive ? 'transparent' : 'var(--border)'}`,
                  borderRadius: 3,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  boxShadow: isActive ? '0 0 12px var(--brand-glow)' : 'none',
                }}
              >
                {f.label}
              </motion.button>
            );
          })}

          {/* Agent badge */}
          <AnimatePresence>
            {agentActive && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  background: 'var(--ai-dim)',
                  border: '1px solid var(--ai-border)',
                  borderRadius: 3,
                  color: 'var(--ai)',
                  boxShadow: '0 0 12px var(--ai-glow)',
                }}
              >
                <SlidersHorizontal size={11} />
                Agente IA activo
                <button
                  onClick={clearAgentFilter}
                  style={{ display: 'flex', cursor: 'pointer', background: 'none', border: 'none', color: 'inherit', opacity: 0.7, marginLeft: 2 }}
                >
                  <X size={11} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Price slider (right) */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 11, color: 'var(--fg-tertiary)', whiteSpace: 'nowrap' }}>
              Hasta: <strong style={{ color: 'var(--fg-primary)', fontFamily: 'var(--font-display)' }}>{formatARS(maxPrice)}</strong>
            </span>
            <input
              type="range"
              min={MIN_PRICE}
              max={MAX_PRICE}
              step={500_000}
              value={maxPrice}
              onChange={e => { setMaxPrice(Number(e.target.value)); clearAgentFilter(); }}
              style={{ width: 110 }}
            />
          </div>
        </div>

        {/* ── Catalog Grid ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                height: '100%', gap: 12, color: 'var(--fg-tertiary)',
              }}
            >
              <Car size={48} strokeWidth={1} />
              <p style={{ fontSize: 18, fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--fg-secondary)' }}>Sin resultados</p>
              <p style={{ fontSize: 13 }}>Probá ajustando los filtros o pedile al Agente que te ayude.</p>
              <button
                onClick={() => { setSearch(''); setActiveType('all'); clearAgentFilter(); setMaxPrice(MAX_PRICE); }}
                style={{
                  marginTop: 8, padding: '8px 20px',
                  background: 'var(--brand)', color: '#fff',
                  fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
                  border: 'none', borderRadius: 3, cursor: 'pointer',
                }}
              >
                Ver todo el catálogo
              </button>
            </motion.div>
          ) : (
            <>
              <p style={{ fontSize: 12, color: 'var(--fg-tertiary)', marginBottom: 18, letterSpacing: '0.05em' }}>
                {filtered.length} vehículo{filtered.length !== 1 ? 's' : ''} disponible{filtered.length !== 1 ? 's' : ''}
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 16,
              }}>
                {filtered.map((v, i) => (
                  <CarCard key={v.id} vehicle={v} index={i} onSelect={setSelectedVehicle} />
                ))}
              </div>
            </>
          )}
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
