import { NextResponse } from 'next/server'
import { obtenerTramites, actualizarTramite, crearTramite } from '@/services/tramites'
import type { EstadoTramite } from '@/types/admin'

export async function GET() {
  try {
    const list = await obtenerTramites()
    return NextResponse.json(list)
  } catch (error) {
    console.error('[API Tramites GET] Error:', error)
    return NextResponse.json({ error: 'Error al obtener los trámites' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { id, estado, comprador_nombre, comprador_dni, comprador_email, notas, dni_data } = body
    
    if (!id) {
      return NextResponse.json({ error: 'Falta ID' }, { status: 400 })
    }

    const success = await actualizarTramite(id, {
      estado: estado as EstadoTramite,
      comprador_nombre,
      comprador_dni,
      comprador_email,
      notas,
      dni_data,
    })
    return NextResponse.json({ success })
  } catch (error) {
    console.error('[API Tramites PUT] Error:', error)
    return NextResponse.json({ error: 'Error al actualizar el trámite' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { vehiculo_id, comprador_nombre, comprador_dni, comprador_email, notas } = body

    if (!vehiculo_id || !comprador_nombre || !comprador_dni || !comprador_email) {
      return NextResponse.json({ error: 'Faltan parámetros requeridos' }, { status: 400 })
    }

    const id = await crearTramite({
      vehiculo_id,
      comprador_nombre,
      comprador_dni,
      comprador_email,
      notas,
    })

    return NextResponse.json({ success: !!id, id })
  } catch (error) {
    console.error('[API Tramites POST] Error:', error)
    return NextResponse.json({ error: 'Error al crear el trámite' }, { status: 500 })
  }
}
