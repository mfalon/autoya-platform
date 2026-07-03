import { NextRequest, NextResponse } from 'next/server'
import { obtenerHistorialChat } from '@/services/memoria'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json({ error: 'Falta sessionId' }, { status: 400 })
    }

    const rawHistory = await obtenerHistorialChat(sessionId)
    
    // Adaptamos el formato plano { role, content } al formato del Vercel AI SDK { id, role, content }
    const messages = rawHistory.map((m, idx) => ({
      id: `hist-${idx}-${Date.now()}`,
      role: m.role,
      content: m.content
    }))

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('[API Chat History] Error:', error)
    return NextResponse.json({ error: 'Error al recuperar el historial' }, { status: 500 })
  }
}
