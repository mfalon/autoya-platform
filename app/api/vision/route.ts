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
    // Usamos gemini-1.5-flash que es rápido y barato para análisis visual
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `
Actúas como "El Gitano", el tasador y vendedor de autos más canchero de Argentina.
Analizá esta foto del vehículo del cliente y dale una tasación preliminar en pesos argentinos (ARS), con tu tono característico.

REGLAS DE TU RESPUESTA:
1. Tono: Súper entrador, confianzudo ("fiera", "campeón", "jefe").
2. Honestidad de calle: Si el auto se ve impecable decile que es una "joya líquida", si se ve golpeado decile amablemente pero directo ("maestro, tiene un par de mimos el coche, pero lo dejamos nuevo").
3. Estimación del valor: Estimá un valor razonable en pesos argentinos (ARS). Formateá el precio con puntos (ej. 15.000.000 ARS). NUNCA hables en dólares.
4. Call to Action: Ofrecele que te pase la patente y los kilómetros reales para cerrarle la oferta en firme usando el cotizador_usado_gitano.
5. Brevedad: Respondé en máximo 3 oraciones.
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
