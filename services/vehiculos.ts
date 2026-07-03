import { supabase } from '@/lib/supabase'
import { VEHICLES, type Vehicle } from '@/data/vehicles'

export async function obtenerVehiculos(): Promise<Vehicle[]> {
  if (!supabase) {
    // Fallback local en memoria
    return VEHICLES
  }

  try {
    const { data, error } = await supabase
      .from('vehiculos')
      .select('*')
      .order('brand', { ascending: true })

    if (error) throw error

    if (!data || data.length === 0) {
      return VEHICLES
    }

    // Adaptamos el esquema de Supabase al del frontend
    return data.map((v: any) => ({
      id: String(v.id),
      brand: v.brand,
      model: v.model,
      version: v.version || '',
      year: Number(v.year),
      condition: v.condition as '0km' | 'Usado',
      km: Number(v.km || 0),
      body_type: v.body_type as any,
      fuel_type: v.fuel_type || 'Nafta',
      precio_ars: Number(v.precio_ars),
      precio_piso_ars: Number(v.precio_piso_ars || v.precio_ars * 0.90), // fallback al 90%
      color: v.color || 'Blanco',
      image: v.image_url || '/cars/sedan.png',
      featured: v.featured || false,
      specs: {
        power_cv: v.specs_power || 150,
        acceleration: v.specs_acc || '8.5s',
        top_speed: v.specs_speed || '210 km/h',
        autonomy: v.specs_autonomy || '650 km'
      }
    }))
  } catch (err) {
    console.error('[Services Vehiculos] Error al conectar con Supabase:', err)
    return VEHICLES
  }
}

export async function actualizarEstadoVehiculo(id: string, nuevoEstado: 'disponible' | 'reservado' | 'vendido'): Promise<boolean> {
  if (!supabase) {
    // En modo local simulado, siempre retorna éxito
    const index = VEHICLES.findIndex(v => v.id === id)
    if (index !== -1) {
      // Mockeamos la actualización en memoria estática
      VEHICLES[index].condition = VEHICLES[index].condition // no-op
    }
    return true
  }

  try {
    const { error } = await supabase
      .from('vehiculos')
      .update({ estado: nuevoEstado })
      .eq('id', id)

    if (error) throw error
    return true
  } catch (err) {
    console.error(`[Services Vehiculos] Error al actualizar estado de ${id}:`, err)
    return false
  }
}
