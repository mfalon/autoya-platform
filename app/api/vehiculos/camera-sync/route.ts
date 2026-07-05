import { NextRequest, NextResponse } from 'next/server'
import { guardarFotoSync, obtenerFotoSync } from '@/services/cameraSync'

function withCors(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 })
  return withCors(response)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { syncId, image } = body

    if (!syncId || !image) {
      return withCors(NextResponse.json({ error: 'Parámetros syncId e image son requeridos' }, { status: 400 }))
    }

    const success = await guardarFotoSync(syncId, image)
    return withCors(NextResponse.json({ success }))
  } catch (error) {
    console.error('[API Camera Sync POST] Error:', error)
    return withCors(NextResponse.json({ error: 'Error al sincronizar foto' }, { status: 500 }))
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const syncId = searchParams.get('syncId')

    if (!syncId) {
      return withCors(NextResponse.json({ error: 'syncId es requerido' }, { status: 400 }))
    }

    const image = await obtenerFotoSync(syncId)
    return withCors(NextResponse.json({ success: true, image }))
  } catch (error) {
    console.error('[API Camera Sync GET] Error:', error)
    return withCors(NextResponse.json({ error: 'Error al consultar sincronización' }, { status: 500 }))
  }
}
