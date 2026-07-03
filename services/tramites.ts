import { supabase } from '@/lib/supabase'
import { MOCK_TRAMITES, type Tramite, type EstadoTramite } from '@/types/admin'

export async function obtenerTramites(): Promise<Tramite[]> {
  if (!supabase) {
    return MOCK_TRAMITES
  }

  try {
    const { data, error } = await supabase
      .from('tramites_legales')
      .select(`
        id,
        estado,
        comprador_nombre,
        comprador_dni,
        comprador_email,
        notas,
        created_at,
        dni_data,
        vehiculos (
          brand,
          model,
          year,
          precio_ars
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    if (!data || data.length === 0) {
      return MOCK_TRAMITES
    }

    return data.map((t: any) => {
      const vehiculo = t.vehiculos || {}
      return {
        id: String(t.id),
        vehiculo_brand: vehiculo.brand || 'Desconocido',
        vehiculo_model: vehiculo.model || 'Desconocido',
        vehiculo_year: Number(vehiculo.year || 2024),
        precio_ars: Number(vehiculo.precio_ars || 0),
        comprador_nombre: t.comprador_nombre || 'Cliente Anónimo',
        comprador_dni: t.comprador_dni || '',
        comprador_email: t.comprador_email || '',
        estado: t.estado as EstadoTramite,
        notas: t.notas || '',
        created_at: t.created_at,
        dni_procesado: !!t.dni_data,
      }
    })
  } catch (err) {
    console.error('[Services Tramites] Error al obtener trámites de Supabase:', err)
    return MOCK_TRAMITES
  }
}

export async function actualizarTramite(id: string, campos: {
  estado?: EstadoTramite
  comprador_nombre?: string
  comprador_dni?: string
  comprador_email?: string
  notas?: string
  dni_data?: any
}): Promise<boolean> {
  if (!supabase) {
    // Modo offline mockeado
    const index = MOCK_TRAMITES.findIndex(t => t.id === id)
    if (index !== -1) {
      if (campos.estado) MOCK_TRAMITES[index].estado = campos.estado
      if (campos.comprador_nombre) MOCK_TRAMITES[index].comprador_nombre = campos.comprador_nombre
      if (campos.comprador_dni) MOCK_TRAMITES[index].comprador_dni = campos.comprador_dni
      if (campos.comprador_email) MOCK_TRAMITES[index].comprador_email = campos.comprador_email
      if (campos.notas !== undefined) MOCK_TRAMITES[index].notas = campos.notas
      if (campos.dni_data) MOCK_TRAMITES[index].dni_procesado = true
    }
    return true
  }

  try {
    const updateData: any = {}
    if (campos.estado) updateData.estado = campos.estado
    if (campos.comprador_nombre) updateData.comprador_nombre = campos.comprador_nombre
    if (campos.comprador_dni) updateData.comprador_dni = campos.comprador_dni
    if (campos.comprador_email) updateData.comprador_email = campos.comprador_email
    if (campos.notas !== undefined) updateData.notas = campos.notas
    if (campos.dni_data) updateData.dni_data = campos.dni_data

    const { error } = await supabase
      .from('tramites_legales')
      .update(updateData)
      .eq('id', id)

    if (error) throw error
    return true
  } catch (err) {
    console.error(`[Services Tramites] Error al actualizar trámite ${id}:`, err)
    return false
  }
}

export async function crearTramite(datos: {
  vehiculo_id: string
  comprador_nombre: string
  comprador_dni: string
  comprador_email: string
  notas?: string
}): Promise<string | null> {
  if (!supabase) {
    const nuevoId = `t-${Date.now()}`
    // Mockeamos la inserción local
    MOCK_TRAMITES.push({
      id: nuevoId,
      vehiculo_brand: 'Mock',
      vehiculo_model: 'Unidad Reservada',
      vehiculo_year: 2024,
      precio_ars: 20000000,
      comprador_nombre: datos.comprador_nombre,
      comprador_dni: datos.comprador_dni,
      comprador_email: datos.comprador_email,
      estado: 'reserva',
      notas: datos.notas || '',
      created_at: new Date().toISOString(),
      dni_procesado: false,
    })
    return nuevoId
  }

  try {
    const { data, error } = await supabase
      .from('tramites_legales')
      .insert({
        vehiculo_id: datos.vehiculo_id,
        comprador_nombre: datos.comprador_nombre,
        comprador_dni: datos.comprador_dni,
        comprador_email: datos.comprador_email,
        estado: 'reserva',
        notas: datos.notas || '',
      })
      .select('id')
      .single()

    if (error) throw error
    return data ? String(data.id) : null
  } catch (err) {
    console.error('[Services Tramites] Error al crear trámite:', err)
    return null
  }
}
