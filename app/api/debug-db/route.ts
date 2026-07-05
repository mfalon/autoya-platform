import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase client is null. Environment variables are missing.' })
  }

  try {
    const { data: selectData, error: selectError } = await supabase
      .from('chat_memoria')
      .select('*')
      .limit(1)

    const testSessionKey = `debug-test-${Date.now()}`
    const { data: insertData, error: insertError } = await supabase
      .from('chat_memoria')
      .insert({
        session_id: testSessionKey,
        mensaje: 'Test connection',
        rol: 'user'
      })
      .select()

    // Clean up if it succeeded
    if (!insertError && insertData && insertData.length > 0) {
      await supabase
        .from('chat_memoria')
        .delete()
        .eq('session_id', testSessionKey)
    }

    return NextResponse.json({
      supabaseConnected: true,
      select: {
        success: !selectError,
        error: selectError ? selectError.message : null,
        data: selectData
      },
      insert: {
        success: !insertError,
        error: insertError ? insertError.message : null,
        data: insertData
      }
    })
  } catch (err: any) {
    return NextResponse.json({
      error: 'Unhandled exception',
      message: err.message,
      stack: err.stack
    }, { status: 500 })
  }
}
