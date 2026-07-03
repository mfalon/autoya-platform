import { NextResponse } from 'next/server'
import { obtenerVehiculos, crearVehiculo, actualizarVehiculo } from '@/services/vehiculos'

export async function GET() {
  try {
    const list = await obtenerVehiculos()
    return NextResponse.json(list)
  } catch (error) {
    console.error('[API Vehiculos GET] Error:', error)
    return NextResponse.json({ error: 'Error al obtener los vehículos del catálogo' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { brand, model, version, year, condition, km, body_type, fuel_type, precio_ars, precio_piso_ars, color, estado, image, featured, specs } = body

    if (!brand || !model || !precio_ars) {
      return NextResponse.json({ error: 'Faltan parámetros requeridos' }, { status: 400 })
    }

    const id = await crearVehiculo({
      brand,
      model,
      version: version || '',
      year: Number(year) || 2024,
      condition: condition || '0km',
      km: Number(km) || 0,
      body_type: body_type || 'sedan',
      fuel_type: fuel_type || 'Nafta',
      precio_ars: Number(precio_ars),
      precio_piso_ars: Number(precio_piso_ars || precio_ars * 0.90),
      color: color || 'Blanco',
      estado: estado || 'disponible',
      image: image || '/cars/sedan.png',
      featured: !!featured,
      specs: specs || { power_cv: 150, acceleration: '8.5s', top_speed: '210 km/h', autonomy: '650 km' }
    })

    return NextResponse.json({ success: !!id, id })
  } catch (error) {
    console.error('[API Vehiculos POST] Error:', error)
    return NextResponse.json({ error: 'Error al crear el vehículo' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { id, ...campos } = body

    if (!id) {
      return NextResponse.json({ error: 'Falta ID del vehículo' }, { status: 400 })
    }

    const success = await actualizarVehiculo(id, campos)
    return NextResponse.json({ success })
  } catch (error) {
    console.error('[API Vehiculos PUT] Error:', error)
    return NextResponse.json({ error: 'Error al actualizar el vehículo' }, { status: 500 })
  }
}
