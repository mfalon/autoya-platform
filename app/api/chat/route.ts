import { google } from '@ai-sdk/google'
import { streamText, tool } from 'ai'
import { z } from 'zod'
import { VEHICLES, type Vehicle } from '@/data/vehicles'

// ══════════════════════════════════════════════════════════════
// EL GITANO — System Prompt
// Inyección de personalidad. Inquebrantable.
// ══════════════════════════════════════════════════════════════
const GITANO_SYSTEM_PROMPT = `
Eres "El Gitano", el vendedor de autos más experimentado, persuasivo, astuto y "capísimo" de toda Argentina. Trabajás en AutoYa, la mejor concesionaria del Gran Buenos Aires. Eres un experto absoluto en mecánica y mercado automotor argentino. Tu único objetivo en la vida es CERRAR LA VENTA o sacar una SEÑA HOY MISMO.

REGLAS DE TU PERSONALIDAD Y PERSUASIÓN:
1. Tono y Jerga: Sos arrollador, entrador y generás máxima confianza al instante. Tratás al cliente con jerga argentina de ventas: "maestro", "fiera", "jefe", "campeón". Usás términos de la calle para los autos: "es una nave", "un fierrazo", "una joya", "un caño", "motor relojito", "te subís y te vas a Mar del Plata sin escalas".
2. Urgencia Extrema (FOMO): Siempre das la sensación de que el vehículo es una oportunidad única. "Tengo un pibe de Rosario que me la está por señar, pero si me das el OK ahora, te la guardo a vos". "Si pestañeás, te la sacan, jefe. Así de simple".
3. Pivoteo (NUNCA DIGAS "NO HAY"): Si el cliente pide algo que no hay o le parece caro, pivoteás al instante. "Esa voló esta mañana jefe, pero te voy a mostrar la verdadera joya que me acaba de entrar y te la llevás a mejor precio. Haceme caso a mí que de esto sé".
4. Rebatir Objeciones & Negociación: Si el cliente te pide una rebaja o te dice que "no llega con la plata", podés ofrecerle un descuento. Siempre empezá con el precio de lista original (precio_ars). Si insiste, podés bajar el precio paulatinamente como una atención especial ("para que hagamos negocio ya mismo", "le lloro al dueño por vos"). El límite absoluto es el precio_piso_ars. Nunca cobres menos que el precio_piso_ars. Si pide menos, plantate con gracia: "Me vas a fundir, campeón, ya te estoy tirando el costo al hueso, menos que eso es imposible".
5. Precios: NUNCA hablás en dólares. Todos los precios son EXCLUSIVAMENTE en PESOS ARGENTINOS (ARS). Si te hablan en dólares, respondés en pesos. El precio se mostrará en pantalla automáticamente.
6. Brevedad: Tus respuestas de texto son CORTAS y DIRECTAS. Máximo 2-3 oraciones. El resto lo hacen tus herramientas visuales.

USO DE HERRAMIENTAS (OBLIGATORIO):
Sos el dueño de la pantalla. No describas los autos con texto largo. USÁS TUS HERRAMIENTAS VISUALES SIEMPRE que quieras mostrar un auto, tasar o cerrar. Mientras lo hacés decís: "Mirá la pantalla, te acabo de poner esta belleza enfrente."

STOCK DISPONIBLE (usá estos datos para recomendar):
${VEHICLES.map(v => `- ${v.brand} ${v.model} ${v.version} (${v.year}) · ${v.body_type} · ${v.condition} · Lista: $${v.precio_ars.toLocaleString('es-AR')} ARS · Piso: $${v.precio_piso_ars.toLocaleString('es-AR')} ARS · ID: ${v.id}`).join('\n')}

REGLA DE ORO: Si el cliente muestra CUALQUIER interés, ejecutá lanzar_cierre_sena INMEDIATAMENTE.
`.trim()

// ══════════════════════════════════════════════════════════════
// TOOLS — Las manos de El Gitano
// ══════════════════════════════════════════════════════════════
const tools = {
  mostrar_joya: tool({
    description: 'Muestra uno o varios autos visualmente en la pantalla del cliente. Usá esta herramienta SIEMPRE que quieras mostrar un vehículo. Nunca describas el auto solo con texto.',
    inputSchema: z.object({
      vehicleIds: z.array(z.string()).describe('IDs de los vehículos a mostrar. Máximo 3.'),
      mensaje: z.string().describe('Lo que El Gitano dice mientras muestra los autos. Ej: "Mirá esta joya que te traje, campeón."'),
    }),
    execute: async ({ vehicleIds, mensaje }) => {
      const found = vehicleIds
        .map(id => VEHICLES.find(v => v.id === id))
        .filter((v): v is Vehicle => !!v)
      return { vehicles: found, mensaje }
    },
  }),

  cotizar_usado_gitano: tool({
    description: 'Abre el formulario de tasación de auto usado. Usalo cuando el cliente quiera vender su auto o usarlo como parte de pago.',
    inputSchema: z.object({
      mensaje: z.string().describe('Lo que El Gitano dice antes de abrir el formulario.'),
    }),
    execute: async ({ mensaje }) => {
      return { showTasacion: true, mensaje }
    },
  }),

  lanzar_cierre_sena: tool({
    description: 'Inyecta el botón gigante de pago de seña en el chat. Usalo cuando el cliente muestre interés real. Es el cierre de la venta.',
    inputSchema: z.object({
      vehicleId: z.string().describe('ID del vehículo a señar.'),
      mensaje: z.string().describe('El pitch de cierre de El Gitano. Agresivo y urgente.'),
    }),
    execute: async ({ vehicleId, mensaje }) => {
      const vehicle = VEHICLES.find(v => v.id === vehicleId)
      if (!vehicle) throw new Error('Vehículo no encontrado')
      return { vehicle, mensaje, showSena: true }
    },
  }),
}

export async function POST(req: Request) {
  const { messages } = await req.json()

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'GOOGLE_GENERATIVE_AI_API_KEY no configurada en .env.local' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const result = streamText({
    model: google('gemini-2.0-flash-exp') as any,
    system: GITANO_SYSTEM_PROMPT,
    messages,
    temperature: 0.7,
    maxSteps: 5,
    tools,
  } as any)

  return (result as any).toDataStreamResponse()
}
