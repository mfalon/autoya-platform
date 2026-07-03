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
      estado: v.estado || 'disponible',
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
      VEHICLES[index].estado = nuevoEstado
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

export async function crearVehiculo(v: Omit<Vehicle, 'id'>): Promise<string | null> {
  if (!supabase) {
    const nuevoId = `car-${Date.now()}`
    // Guardado local en memoria
    VEHICLES.push({ id: nuevoId, ...v })
    return nuevoId
  }

  try {
    const { data, error } = await supabase
      .from('vehiculos')
      .insert({
        brand: v.brand,
        model: v.model,
        version: v.version,
        year: v.year,
        condition: v.condition,
        km: v.km,
        body_type: v.body_type,
        fuel_type: v.fuel_type,
        precio_ars: v.precio_ars,
        precio_piso_ars: v.precio_piso_ars || Math.round(v.precio_ars * 0.90),
        color: v.color,
        estado: v.estado || 'disponible',
        image_url: v.image,
        featured: v.featured || false,
        specs_power: v.specs?.power_cv || 150,
        specs_acc: v.specs?.acceleration || '8.5s',
        specs_speed: v.specs?.top_speed || '210 km/h',
        specs_autonomy: v.specs?.autonomy || '650 km'
      })
      .select('id')
      .single()

    if (error) throw error
    return data ? String(data.id) : null
  } catch (err) {
    console.error('[Services Vehiculos] Error al crear vehículo:', err)
    return null
  }
}

export async function actualizarVehiculo(id: string, v: Partial<Vehicle>): Promise<boolean> {
  if (!supabase) {
    // Actualización local en memoria
    const index = VEHICLES.findIndex(item => item.id === id)
    if (index !== -1) {
      VEHICLES[index] = { ...VEHICLES[index], ...v }
    }
    return true
  }

  try {
    const updateData: any = {}
    if (v.brand) updateData.brand = v.brand
    if (v.model) updateData.model = v.model
    if (v.version !== undefined) updateData.version = v.version
    if (v.year !== undefined) updateData.year = v.year
    if (v.condition) updateData.condition = v.condition
    if (v.km !== undefined) updateData.km = v.km
    if (v.body_type) updateData.body_type = v.body_type
    if (v.fuel_type) updateData.fuel_type = v.fuel_type
    if (v.precio_ars !== undefined) updateData.precio_ars = v.precio_ars
    if (v.precio_piso_ars !== undefined) updateData.precio_piso_ars = v.precio_piso_ars
    if (v.color !== undefined) updateData.color = v.color
    if (v.estado) updateData.estado = v.estado
    if (v.image) updateData.image_url = v.image
    if (v.featured !== undefined) updateData.featured = v.featured
    
    if (v.specs) {
      if (v.specs.power_cv !== undefined) updateData.specs_power = v.specs.power_cv
      if (v.specs.acceleration !== undefined) updateData.specs_acc = v.specs.acceleration
      if (v.specs.top_speed !== undefined) updateData.specs_speed = v.specs.top_speed
      if (v.specs.autonomy !== undefined) updateData.specs_autonomy = v.specs.autonomy
    }

    const { error } = await supabase
      .from('vehiculos')
      .update(updateData)
      .eq('id', id)

    if (error) throw error
    return true
  } catch (err) {
    console.error(`[Services Vehiculos] Error al actualizar vehículo ${id}:`, err)
    return false
  }
}
