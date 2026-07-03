import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export interface DniData {
  apellido:    string
  nombres:     string
  dni:         string  // sin puntos
  cuil:        string
  tramite:     string
  nacimiento:  string  // ISO 8601
  domicilio:   string
  vencimiento: string
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key de Gemini no configurada. Agregá GOOGLE_GENERATIVE_AI_API_KEY al .env.local' },
        { status: 503 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('image') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No se recibió ninguna imagen' }, { status: 400 })
    }

    // Validación de tipo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo de archivo no permitido. Usá JPG, PNG o WEBP.' }, { status: 400 })
    }

    // Convertir a base64
    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')

    // Procesar con Gemini Vision (multimodal)
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `Analizá esta imagen de un DNI argentino y extraé los datos en formato JSON estricto.
    
Devolvé ÚNICAMENTE el JSON sin markdown ni explicaciones, con esta estructura exacta:
{
  "apellido": "string",
  "nombres": "string", 
  "dni": "string (solo números, sin puntos)",
  "cuil": "string (formato XX-XXXXXXXX-X)",
  "tramite": "string (número de trámite)",
  "nacimiento": "string (formato DD/MM/YYYY)",
  "domicilio": "string (dirección completa)",
  "vencimiento": "string (formato DD/MM/YYYY)"
}

Si no podés leer algún campo con certeza, devolvé "" para ese campo.`

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64, mimeType: file.type } },
    ])

    const text = result.response.text().trim()

    // Parsear JSON de la respuesta
    let dniData: DniData
    try {
      // Remover posibles bloques de código markdown
      const cleaned = text.replace(/```json\n?|\n?```/g, '').trim()
      dniData = JSON.parse(cleaned)
    } catch {
      return NextResponse.json(
        { error: 'No se pudo parsear la respuesta de Gemini', raw: text },
        { status: 422 }
      )
    }

    // En producción: acá subirías la imagen a Supabase Storage y guardarías en tramites_legales
    // const { data: storageData } = await supabase.storage
    //   .from('documentos')
    //   .upload(`dni/${Date.now()}_${file.name}`, bytes, { contentType: file.type })

    console.log('[OCR] DNI procesado exitosamente:', dniData.dni)

    return NextResponse.json({ success: true, data: dniData })

  } catch (error) {
    console.error('[OCR] Error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
