import { NextRequest, NextResponse } from 'next/server'
import { consultarTramitePorDni } from '@/services/tramites'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const dni = searchParams.get('dni')

    if (!dni) {
      return NextResponse.json({ error: 'El parámetro DNI es requerido' }, { status: 400 })
    }

    const tramite = await consultarTramitePorDni(dni)
    
    if (!tramite) {
      return NextResponse.json({ error: 'No se encontró ningún trámite de transferencia activo para el DNI ingresado' }, { status: 404 })
    }

    return NextResponse.json({ success: true, tramite })
  } catch (error) {
    console.error('[API Tramites Consulta GET] Error:', error)
    return NextResponse.json({ error: 'Error al consultar el trámite' }, { status: 500 })
  }
}
