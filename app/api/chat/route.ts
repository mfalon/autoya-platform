import { google } from '@ai-sdk/google'
import { streamText, tool, toUIMessageStream } from 'ai'
import { z } from 'zod'
import { VEHICLES, type Vehicle } from '@/data/vehicles'
import { obtenerVehiculos } from '@/services/vehiculos'
import { guardarMensajeMemoria, buscarRecuerdosSemanticos } from '@/services/memoria'

// ══════════════════════════════════════════════════════════════
// ASESOR PREMIUM — System Prompt Generator
// ══════════════════════════════════════════════════════════════
function getAsesorPrompt(vehiclesList: Vehicle[], recuerdosContext = '') {
  return `
Eres el "Asesor Premium", un consultor automotriz de alta gama experto en AutoYa. Eres sumamente profesional, educado, atento y experto en el mercado automotor argentino. Tu único objetivo en la vida es asesorar formalmente al cliente para CERRAR LA VENTA o asegurar la RESERVA HOY MISMO.

REGLAS DE TU PERSONALIDAD Y PERSUASIÓN:
1. Tono y Respeto: Tu trato es sumamente formal, amable y corporativo. Te diriges al cliente de "Usted" o un "vos" sumamente respetuoso. Cero modismos vulgares o jerga callejera ("maestro", "fiera", "joyita", "caño" están prohibidos). Utilizas vocabulario distinguido: "unidad", "vehículo", "oportunidad excepcional", "confort", "prestaciones mecánicas superiores".
2. Urgencia Elegante (FOMO): Indicas de forma sobria que la demanda de la unidad es alta. "Le sugiero formalizar la reserva hoy mismo para asegurar este valor, ya que contamos con otras consultas activas por esta unidad."
3. Pivoteo Consultivo: Si el cliente pide algo que no hay o le parece costoso, buscas una alternativa: "Esa unidad ya ha sido reservada, sin embargo, permítame presentarle esta opción de similares características y excelente propuesta de valor."
4. Negociación y Objeciones: Siempre comienzas ofreciendo el precio de lista oficial (precio_ars). Si el cliente solicita condiciones comerciales especiales o plantea objeciones presupuestarias, puedes ofrecer una bonificación especial o una atención comercial. El límite absoluto de descuento es el precio_piso_ars. Bajo ningún concepto debes cotizar por debajo del precio_piso_ars. Si el cliente exige más, responde con firmeza comercial y cortesía: "Lamentablemente, el valor presentado ya se encuentra bonificado al límite de nuestras posibilidades para esta unidad premium."
5. Precios: Hablas exclusivamente en PESOS ARGENTINOS (ARS). Si te consultan en dólares, haces la conversión de manera sobria y respondes en pesos.
6. Brevedad: Tus respuestas son concisas, directas y elegantes. Máximo 2 o 3 oraciones en texto plano. Las herramientas visuales muestran los detalles del auto.

USO DE HERRAMIENTAS (OBLIGATORIO):
Tú controlas la interfaz. No describas los autos con largos textos. Utiliza las herramientas de pantalla de manera obligatoria cuando desees mostrar un auto, abrir la tasación o iniciar la reserva. Di: "Le presento en pantalla la información correspondiente."

STOCK DISPONIBLE:
${vehiclesList.map(v => `- ${v.brand} ${v.model} ${v.version} (${v.year}) · ${v.body_type} · ${v.condition} · Lista: $${v.precio_ars.toLocaleString('es-AR')} ARS · Piso: $${v.precio_piso_ars.toLocaleString('es-AR')} ARS · ID: ${v.id}`).join('\n')}
${recuerdosContext}

REGLA DE ORO: Si el cliente muestra interés concreto, ejecuta lanzar_cierre_sena de manera inmediata.
`.trim()
}

// ══════════════════════════════════════════════════════════════
// TOOLS — Las manos del Asesor Premium
// ══════════════════════════════════════════════════════════════
const tools = {
  mostrar_joya: tool({
    description: 'Muestra uno o varios vehículos visualmente en la pantalla. Úsalo siempre que recomiendes un vehículo del inventario.',
    inputSchema: z.object({
      vehicleIds: z.array(z.string()).describe('IDs de los vehículos a mostrar. Máximo 3.'),
      mensaje: z.string().describe('Lo que el Asesor dice mientras inyecta las tarjetas. Ej: "Le presento la propuesta en pantalla."'),
    }),
    execute: async ({ vehicleIds, mensaje }) => {
      const found = vehicleIds
        .map(id => VEHICLES.find(v => v.id === id))
        .filter((v): v is Vehicle => !!v)
      return { vehicles: found, mensaje }
    },
  }),

  cotizar_usado_gitano: tool({
    description: 'Abre el formulario oficial de cotización y tasación de vehículos usados.',
    inputSchema: z.object({
      mensaje: z.string().describe('Lo que el Asesor dice para presentar el formulario de tasación.'),
    }),
    execute: async ({ mensaje }) => {
      return { showTasacion: true, mensaje }
    },
  }),

  lanzar_cierre_sena: tool({
    description: 'Inyecta el botón de pago seguro de seña para reservar la unidad en el chat.',
    inputSchema: z.object({
      vehicleId: z.string().describe('ID del vehículo a reservar.'),
      mensaje: z.string().describe('El mensaje formal para invitar al cliente a asegurar la unidad.'),
    }),
    execute: async ({ vehicleId, mensaje }) => {
      const vehicle = VEHICLES.find(v => v.id === vehicleId)
      if (!vehicle) throw new Error('Vehículo no encontrado')
      return { vehicle, mensaje, showSena: true }
    },
  }),
}

export async function POST(req: Request) {
  const { messages, sessionId } = await req.json()

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'GEMINI_API_KEY o GOOGLE_GENERATIVE_AI_API_KEY no configurada en .env.local' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // 1. Búsqueda vectorial semántica de recuerdos si hay sesión
  let recuerdosContext = ''
  const lastUserMsg = messages[messages.length - 1]?.content || ''
  if (sessionId && lastUserMsg) {
    try {
      const recuerdos = await buscarRecuerdosSemanticos(sessionId, lastUserMsg)
      if (recuerdos.length > 0) {
        recuerdosContext = `\n\nRECUERDOS DE CHARLAS PREVIAS CON ESTE CLIENTE (Úsalos con naturalidad si es relevante):\n${recuerdos.map(r => `- El cliente mencionó: "${r}"`).join('\n')}`
      }
    } catch (memErr) {
      console.error('[Chat API] Error al obtener recuerdos semánticos:', memErr)
    }
  }

  // Obtenemos los vehículos desde el servicio adaptado (Supabase o Fallback)
  const vehiculos = await obtenerVehiculos()
  const systemPrompt = getAsesorPrompt(vehiculos, recuerdosContext)

  // 2. Persistir de forma asíncrona el mensaje enviado por el usuario
  if (sessionId && lastUserMsg) {
    guardarMensajeMemoria({
      sessionId,
      mensaje: lastUserMsg,
      rol: 'user'
    }).catch(err => console.error('[Chat API] Error al guardar mensaje de usuario:', err))
  }

  const result = streamText({
    model: google('gemini-2.5-flash') as any,
    system: systemPrompt,
    messages,
    temperature: 0.5, // Menor temperatura para mantener el tono profesional y evitar desvíos del rol
    maxSteps: 5,
    tools,
    onFinish: async ({ text }: any) => {
      // 3. Persistir de forma asíncrona la respuesta completada por la IA
      if (sessionId && text) {
        try {
          await guardarMensajeMemoria({
            sessionId,
            mensaje: text,
            rol: 'assistant'
          })
        } catch (err) {
          console.error('[Chat API] Error al guardar respuesta del asistente:', err)
        }
      }
    }
  } as any)

  return new Response(toUIMessageStream(result), {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
