import { supabase } from '@/lib/supabase'
import { GoogleGenerativeAI } from '@google/generative-ai'
import fs from 'fs/promises'
import path from 'path'

const HISTORY_PATH = path.join(process.cwd(), 'data', 'chat_history.json')

export interface ChatMessage {
  id: string
  session_id: string
  mensaje: string
  rol: 'user' | 'assistant'
  created_at: string
}

// Inicializar el SDK de Gemini para embeddings
const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

/**
 * Genera el vector de embedding para un texto dado utilizando Gemini
 */
export async function generarEmbedding(texto: string): Promise<number[] | null> {
  if (!genAI) return null
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' })
    const result = await model.embedContent(texto)
    return result.embedding.values
  } catch (err) {
    console.error('[Embeddings] Error al generar vector:', err)
    return null
  }
}

/**
 * Guarda un mensaje en la memoria vectorial (Supabase o Fallback Local)
 */
export async function guardarMensajeMemoria(datos: {
  sessionId: string
  mensaje: string
  rol: 'user' | 'assistant'
}): Promise<boolean> {
  const embedding = datos.rol === 'user' ? await generarEmbedding(datos.mensaje) : null

  if (!supabase) {
    // Fallback local en archivo JSON
    try {
      let history: ChatMessage[] = []
      try {
        const fileData = await fs.readFile(HISTORY_PATH, 'utf-8')
        history = JSON.parse(fileData)
      } catch {
        // no-op
      }

      const nuevoMsg: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        session_id: datos.sessionId,
        mensaje: datos.mensaje,
        rol: datos.rol,
        created_at: new Date().toISOString()
      }

      history.push(nuevoMsg)
      await fs.writeFile(HISTORY_PATH, JSON.stringify(history, null, 2), 'utf-8')
      return true
    } catch (err) {
      console.error('[Memoria Local] Error al guardar mensaje:', err)
      return false
    }
  }

  try {
    const { error } = await supabase
      .from('chat_memoria')
      .insert({
        session_id: datos.sessionId,
        mensaje: datos.mensaje,
        rol: datos.rol,
        embedding: embedding // pgvector se encarga del formato
      })

    if (error) throw error
    return true
  } catch (err) {
    console.error('[Memoria DB] Error al guardar mensaje:', err)
    return false
  }
}

/**
 * Recupera el historial de chat lineal reciente
 */
export async function obtenerHistorialChat(sessionId: string, limite = 15): Promise<any[]> {
  if (!supabase) {
    try {
      const fileData = await fs.readFile(HISTORY_PATH, 'utf-8')
      const history: ChatMessage[] = JSON.parse(fileData)
      return history
        .filter(m => m.session_id === sessionId)
        .slice(-limite)
        .map(m => ({ role: m.rol, content: m.mensaje }))
    } catch {
      return []
    }
  }

  try {
    const { data, error } = await supabase
      .from('chat_memoria')
      .select('rol, mensaje, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(limite)

    if (error) throw error
    return data.map(m => ({ role: m.rol, content: m.mensaje }))
  } catch (err) {
    console.error('[Memoria DB] Error al recuperar historial:', err)
    return []
  }
}

/**
 * Búsqueda Vectorial Semántica: Encuentra qué mencionó el usuario anteriormente
 */
export async function buscarRecuerdosSemanticos(sessionId: string, query: string, limite = 3): Promise<string[]> {
  const queryEmbedding = await generarEmbedding(query)

  if (!supabase || !queryEmbedding) {
    // Fallback local: búsqueda por palabras clave en las oraciones previas del usuario
    try {
      const fileData = await fs.readFile(HISTORY_PATH, 'utf-8')
      const history: ChatMessage[] = JSON.parse(fileData)
      
      const userKeywords = query.toLowerCase().split(' ').filter(w => w.length > 3)
      const userMatches = history
        .filter(m => m.session_id === sessionId && m.rol === 'user')
        .map(m => {
          let score = 0
          userKeywords.forEach(k => {
            if (m.mensaje.toLowerCase().includes(k)) score += 1
          })
          return { mensaje: m.mensaje, score }
        })
        .filter(m => m.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limite)
        .map(m => m.mensaje)

      return userMatches
    } catch {
      return []
    }
  }

  try {
    // Ejecutamos una llamada RPC a una función personalizada de coseno similitud en postgres
    const { data, error } = await supabase.rpc('buscar_memorias_chat', {
      query_session_id: sessionId,
      query_embedding: queryEmbedding,
      match_threshold: 0.70, // similitud mínima del 70%
      match_count: limite
    })

    if (error) throw error
    return (data || []).map((m: any) => m.mensaje)
  } catch (err) {
    console.error('[Memoria DB] Búsqueda vectorial fallida:', err)
    return []
  }
}
