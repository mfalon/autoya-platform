import { NextResponse } from 'next/server'
import { enviarRecordatorioWhatsApp, obtenerLogsWhatsApp } from '@/services/whatsapp'

export async function GET() {
  try {
    const list = await obtenerLogsWhatsApp()
    return NextResponse.json(list)
  } catch (error) {
    console.error('[API WhatsApp GET] Error:', error)
    return NextResponse.json({ error: 'Error al obtener logs de notificaciones' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { compradorNombre, compradorTelefono, vehiculoModelo, precioARS } = body

    if (!compradorNombre || !vehiculoModelo || !precioARS) {
      return NextResponse.json({ error: 'Faltan parámetros requeridos' }, { status: 400 })
    }

    const success = await enviarRecordatorioWhatsApp({
      compradorNombre,
      compradorTelefono,
      vehiculoModelo,
      precioARS,
    })

    return NextResponse.json({ success })
  } catch (error) {
    console.error('[API WhatsApp POST] Error:', error)
    return NextResponse.json({ error: 'Error al enviar recordatorio' }, { status: 500 })
  }
}
