import { NextRequest, NextResponse } from 'next/server'
import { obtenerLogsAuditoria, registrarAccion } from '@/services/auditoria'

export async function GET() {
  try {
    const logs = await obtenerLogsAuditoria()
    return NextResponse.json(logs)
  } catch (err) {
    console.error('[API Audit Logs] Error:', err)
    return NextResponse.json({ error: 'Error al obtener bitácora de seguridad' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { usuario, rol, accion, detalles } = body

    await registrarAccion(usuario, rol, accion, detalles)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[API Audit Logs] Error guardando log:', err)
    return NextResponse.json({ error: 'Error al guardar log' }, { status: 500 })
  }
}
