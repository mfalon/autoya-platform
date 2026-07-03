import { NextRequest, NextResponse } from 'next/server'
import { guardarFotoSync, obtenerFotoSync } from '@/services/cameraSync'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { syncId, image } = body

    if (!syncId || !image) {
      return NextResponse.json({ error: 'Parámetros syncId e image son requeridos' }, { status: 400 })
    }

    const success = await guardarFotoSync(syncId, image)
    return NextResponse.json({ success })
  } catch (error) {
    console.error('[API Camera Sync POST] Error:', error)
    return NextResponse.json({ error: 'Error al sincronizar foto' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const syncId = searchParams.get('syncId')

    if (!syncId) {
      return NextResponse.json({ error: 'syncId es requerido' }, { status: 400 })
    }

    const image = await obtenerFotoSync(syncId)
    return NextResponse.json({ success: true, image })
  } catch (error) {
    console.error('[API Camera Sync GET] Error:', error)
    return NextResponse.json({ error: 'Error al consultar sincronización' }, { status: 500 })
  }
}
