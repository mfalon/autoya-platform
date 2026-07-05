import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GOOGLE_GENERATIVE_AI_API_KEY no configurada en .env.local' },
        { status: 503 }
      )
    }

    const { image, mimeType } = await req.json()

    if (!image || !mimeType) {
      return NextResponse.json({ error: 'Faltan datos de la imagen' }, { status: 400 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    // Usamos gemini-2.5-flash que es rápido y barato para análisis visual
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `
Actúas como el "Asesor Premium", un consultor de ventas y tasador automotriz altamente profesional en AutoYa.
Analiza esta fotografía del vehículo del cliente y proporciona una tasación estimada preliminar en pesos argentinos (ARS), con tu tono sumamente formal y corporativo.

REGLAS DE TU RESPUESTA:
1. Tono: Respetuoso, formal y analítico. Dirígete al cliente de "Usted" o "Vos" con suma cortesía.
2. Evaluación técnica: Si la unidad se observa en condiciones óptimas, felicita al propietario de forma sobria. Si tiene detalles de desgaste o daños, indícalos con tacto y objetividad profesional.
3. Estimación del valor: Calcula un precio aproximado razonable en pesos argentinos (ARS). Expresa el valor formateado (ej. 15.000.000 ARS). Queda estrictamente prohibido mencionar montos en dólares u otras divisas.
4. Call to Action: Sugiere al cliente completar el formulario oficial de tasación ingresando la patente y los kilómetros reales para brindarle una oferta en firme.
5. Brevedad: Limita tu respuesta a un máximo de 3 oraciones.
`.trim()

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: image, mimeType } },
    ])

    const text = result.response.text().trim()

    return NextResponse.json({ success: true, text })

  } catch (error) {
    console.error('[Vision API] Error:', error)
    return NextResponse.json({ error: 'Error interno del servidor en el análisis visual' }, { status: 500 })
  }
}
