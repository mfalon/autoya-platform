import { NextRequest, NextResponse } from 'next/server'
import { crearReserva, type ReservaPayload } from '@/services/mercadopago'
import { VEHICLES } from '@/data/vehicles'
import { crearTramite } from '@/services/tramites'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      vehicleId: string
      comprador: { nombre: string; email: string; dni: string }
    }

    const { vehicleId, comprador } = body

    if (!vehicleId || !comprador?.email || !comprador?.nombre) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    const vehicle = VEHICLES.find(v => v.id === vehicleId)
    if (!vehicle) {
      return NextResponse.json({ error: 'Vehículo no encontrado' }, { status: 404 })
    }

    // 1. Creamos el trámite en el Kanban (Supabase o Fallback)
    await crearTramite({
      vehiculo_id: vehicleId,
      comprador_nombre: comprador.nombre,
      comprador_dni: comprador.dni,
      comprador_email: comprador.email,
      notas: `Preferencia de pago MercadoPago creada de forma segura.`,
    })

    // 2. Generamos el link de checkout de MercadoPago
    const payload: ReservaPayload = { vehicle, comprador }
    const result = await crearReserva(payload)

    return NextResponse.json(result)
  } catch (err) {
    console.error('[API /reserva]', err)
    return NextResponse.json({ error: 'Error creando la reserva' }, { status: 500 })
  }
}
