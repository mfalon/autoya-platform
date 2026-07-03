'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Car, DollarSign, Settings, Image as ImageIcon, Save, Check } from 'lucide-react'
import type { Vehicle } from '@/data/vehicles'

interface VehicleEditModalProps {
  vehicle?: Vehicle | null // Si no se provee, es modo creación
  onClose: () => void
  onSave: () => void
}

export default function VehicleEditModal({ vehicle, onClose, onSave }: VehicleEditModalProps) {
  const isEdit = !!vehicle

  // Datos básicos
  const [brand, setBrand] = useState(vehicle?.brand || '')
  const [model, setModel] = useState(vehicle?.model || '')
  const [version, setVersion] = useState(vehicle?.version || '')
  const [year, setYear] = useState(vehicle?.year || 2024)
  const [condition, setCondition] = useState<'0km' | 'Usado'>(vehicle?.condition || '0km')
  const [km, setKm] = useState(vehicle?.km || 0)
  const [bodyType, setBodyType] = useState(vehicle?.body_type || 'sedan')
  const [fuelType, setFuelType] = useState(vehicle?.fuel_type || 'Nafta')
  const [precioArs, setPrecioArs] = useState(vehicle?.precio_ars || 0)
  const [precioPisoArs, setPrecioPisoArs] = useState(vehicle?.precio_piso_ars || 0)
  const [color, setColor] = useState(vehicle?.color || 'Blanco')
  const [estado, setEstado] = useState<'disponible' | 'reservado' | 'vendido'>(vehicle?.estado || 'disponible')
  const [image, setImage] = useState(vehicle?.image || '/cars/sedan.png')
  const [featured, setFeatured] = useState(vehicle?.featured || false)

  // Specs
  const [powerCv, setPowerCv] = useState(vehicle?.specs?.power_cv || 150)
  const [acceleration, setAcceleration] = useState(vehicle?.specs?.acceleration || '8.5s')
  const [topSpeed, setTopSpeed] = useState(vehicle?.specs?.top_speed || '210 km/h')
  const [autonomy, setAutonomy] = useState(vehicle?.specs?.autonomy || '650 km')

  // UI States
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)

    const payload = {
      id: vehicle?.id,
      brand,
      model,
      version,
      year: Number(year),
      condition,
      km: Number(km),
      body_type: bodyType,
      fuel_type: fuelType,
      precio_ars: Number(precioArs),
      precio_piso_ars: Number(precioPisoArs) || Math.round(Number(precioArs) * 0.90),
      color,
      estado,
      image,
      featured,
      specs: {
        power_cv: Number(powerCv),
        acceleration,
        top_speed: topSpeed,
        autonomy,
      }
    }

    try {
      const response = await fetch('/api/vehiculos', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        setSaved(true)
        setTimeout(() => {
          onSave()
          onClose()
        }, 1500)
      } else {
        const data = await response.json()
        alert(data.error || 'Error al guardar el vehículo')
      }
    } catch (err) {
      console.error(err)
      alert('Error de conexión al servidor')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(5,6,10,0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.3 }}
          onClick={e => e.stopPropagation()}
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            width: '100%', maxWidth: 840,
            maxHeight: '90vh',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'var(--bg-card)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Car size={20} style={{ color: 'var(--brand)' }} />
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em' }}>
                  {isEdit ? `Editar Unidad: ${brand} ${model}` : 'Agregar Nueva Unidad al Catálogo'}
                </h2>
                <p style={{ fontSize: 11, color: 'var(--fg-tertiary)', marginTop: 2 }}>
                  {isEdit ? 'Modifique los campos correspondientes del coche.' : 'Complete las especificaciones del nuevo vehículo.'}
                </p>
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--fg-secondary)', cursor: 'pointer', padding: 6 }}>
              <X size={18} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              {/* Bloque 1: Identificación básica */}
              <div>
                <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--brand)', marginBottom: 12 }}>
                  1. Identificación de la Unidad
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="flex-col md:grid">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 11, color: 'var(--fg-secondary)', fontWeight: 600 }}>Marca</label>
                    <input type="text" value={brand} onChange={e => setBrand(e.target.value)} style={{ padding: 10, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 3, fontSize: 13, color: 'var(--fg-primary)', outline: 'none' }} required placeholder="Toyota, Chevrolet..." />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 11, color: 'var(--fg-secondary)', fontWeight: 600 }}>Modelo</label>
                    <input type="text" value={model} onChange={e => setModel(e.target.value)} style={{ padding: 10, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 3, fontSize: 13, color: 'var(--fg-primary)', outline: 'none' }} required placeholder="Corolla, Cruze, Hilux..." />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 11, color: 'var(--fg-secondary)', fontWeight: 600 }}>Versión</label>
                    <input type="text" value={version} onChange={e => setVersion(e.target.value)} style={{ padding: 10, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 3, fontSize: 13, color: 'var(--fg-primary)', outline: 'none' }} placeholder="LTZ, SRX, Premier..." />
                  </div>
                </div>
              </div>

              {/* Bloque 2: Atributos y Estado */}
              <div>
                <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--brand)', marginBottom: 12 }}>
                  2. Características y Estado
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }} className="flex-col md:grid">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 11, color: 'var(--fg-secondary)', fontWeight: 600 }}>Año</label>
                    <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} style={{ padding: 10, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 3, fontSize: 13, color: 'var(--fg-primary)', outline: 'none' }} required min="2000" max="2027" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 11, color: 'var(--fg-secondary)', fontWeight: 600 }}>Condición</label>
                    <select value={condition} onChange={e => setCondition(e.target.value as any)} style={{ padding: 10, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 3, fontSize: 13, color: 'var(--fg-primary)', outline: 'none', cursor: 'pointer' }}>
                      <option value="0km">0km</option>
                      <option value="Usado">Usado</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 11, color: 'var(--fg-secondary)', fontWeight: 600 }}>Kilometraje (km)</label>
                    <input type="number" value={km} onChange={e => setKm(Number(e.target.value))} style={{ padding: 10, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 3, fontSize: 13, color: 'var(--fg-primary)', outline: 'none' }} min="0" disabled={condition === '0km'} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 11, color: 'var(--fg-secondary)', fontWeight: 600 }}>Color</label>
                    <input type="text" value={color} onChange={e => setColor(e.target.value)} style={{ padding: 10, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 3, fontSize: 13, color: 'var(--fg-primary)', outline: 'none' }} placeholder="Gris Plata, Blanco..." />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 16 }} className="flex-col md:grid">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 11, color: 'var(--fg-secondary)', fontWeight: 600 }}>Carrocería</label>
                    <select value={bodyType} onChange={e => setBodyType(e.target.value as any)} style={{ padding: 10, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 3, fontSize: 13, color: 'var(--fg-primary)', outline: 'none', cursor: 'pointer' }}>
                      <option value="sedan">Sedán</option>
                      <option value="hatchback">Hatchback</option>
                      <option value="suv">SUV</option>
                      <option value="pickup">Pickup</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 11, color: 'var(--fg-secondary)', fontWeight: 600 }}>Combustible</label>
                    <select value={fuelType} onChange={e => setFuelType(e.target.value as any)} style={{ padding: 10, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 3, fontSize: 13, color: 'var(--fg-primary)', outline: 'none', cursor: 'pointer' }}>
                      <option value="Nafta">Nafta</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Eléctrico">Eléctrico</option>
                      <option value="Híbrido">Híbrido</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 11, color: 'var(--fg-secondary)', fontWeight: 600 }}>Disponibilidad (Estado)</label>
                    <select value={estado} onChange={e => setEstado(e.target.value as any)} style={{ padding: 10, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 3, fontSize: 13, color: 'var(--fg-primary)', outline: 'none', cursor: 'pointer' }}>
                      <option value="disponible">Disponible</option>
                      <option value="reservado">Reservado</option>
                      <option value="vendido">Vendido</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Bloque 3: Valores financieros */}
              <div>
                <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--brand)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
                  <DollarSign size={13} /> 3. Valores Comerciales
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="flex-col md:grid">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 11, color: 'var(--fg-secondary)', fontWeight: 600 }}>Precio Oficial (de Lista en Pesos)</label>
                    <input type="number" value={precioArs} onChange={e => setPrecioArs(Number(e.target.value))} style={{ padding: 10, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 3, fontSize: 13, fontWeight: 700, color: 'var(--fg-primary)', outline: 'none' }} required min="1" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 11, color: 'var(--fg-secondary)', fontWeight: 600 }}>Precio de Venta Piso (Límite Negociación IA)</label>
                    <input type="number" value={precioPisoArs} onChange={e => setPrecioPisoArs(Number(e.target.value))} style={{ padding: 10, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 3, fontSize: 13, fontWeight: 700, color: 'var(--fg-primary)', outline: 'none' }} placeholder="Opcional (por defecto 90% del precio oficial)" />
                  </div>
                </div>
              </div>

              {/* Bloque 4: Multimedia y Specs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="flex-col md:grid">
                <div>
                  <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--brand)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
                    <ImageIcon size={13} /> 4. URL de Imagen
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 11, color: 'var(--fg-secondary)', fontWeight: 600 }}>Foto de Referencia</label>
                    <input type="text" value={image} onChange={e => setImage(e.target.value)} style={{ padding: 10, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 3, fontSize: 13, color: 'var(--fg-secondary)', outline: 'none' }} required />
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: 'var(--fg-secondary)', cursor: 'pointer', marginTop: 14 }}>
                    <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} style={{ accentColor: 'var(--brand)' }} />
                    Destacar unidad en portada
                  </label>
                </div>

                <div>
                  <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--brand)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
                    <Settings size={13} /> 5. Ficha Técnica (Specs)
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <label style={{ fontSize: 10, color: 'var(--fg-secondary)' }}>Fuerza (CV)</label>
                      <input type="number" value={powerCv} onChange={e => setPowerCv(Number(e.target.value))} style={{ padding: '6px 10px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 3, fontSize: 12, color: 'var(--fg-primary)', outline: 'none' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <label style={{ fontSize: 10, color: 'var(--fg-secondary)' }}>Acel. (0-100)</label>
                      <input type="text" value={acceleration} onChange={e => setAcceleration(e.target.value)} style={{ padding: '6px 10px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 3, fontSize: 12, color: 'var(--fg-primary)', outline: 'none' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <label style={{ fontSize: 10, color: 'var(--fg-secondary)' }}>Vel. Máxima</label>
                      <input type="text" value={topSpeed} onChange={e => setTopSpeed(e.target.value)} style={{ padding: '6px 10px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 3, fontSize: 12, color: 'var(--fg-primary)', outline: 'none' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <label style={{ fontSize: 10, color: 'var(--fg-secondary)' }}>Autonomía</label>
                      <input type="text" value={autonomy} onChange={e => setAutonomy(e.target.value)} style={{ padding: '6px 10px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 3, fontSize: 12, color: 'var(--fg-primary)', outline: 'none' }} />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div style={{
              padding: '16px 32px',
              borderTop: '1px solid var(--border)',
              background: 'var(--bg-card)',
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 14,
            }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '10px 20px', background: 'transparent', border: '1px solid var(--border)',
                  color: 'var(--fg-secondary)', borderRadius: 3, fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', outline: 'none',
                }}
              >
                Cancelar
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '10px 24px', background: 'var(--brand)', color: '#fff',
                    border: 'none', borderRadius: 3, fontSize: 12, fontWeight: 700,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <Save size={13} /> {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
                
                <AnimatePresence>
                  {saved && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      style={{ color: '#22c55e', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      <Check size={14} /> ¡Guardado!
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
