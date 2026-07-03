import { NextResponse } from 'next/server'
import { obtenerVehiculos } from '@/services/vehiculos'

export async function GET() {
  try {
    const list = await obtenerVehiculos()
    return NextResponse.json(list)
  } catch (error) {
    console.error('[API Vehiculos GET] Error:', error)
    return NextResponse.json({ error: 'Error al obtener los vehículos del catálogo' }, { status: 500 })
  }
}
