import { NextRequest, NextResponse } from 'next/server'
import { createClientServer } from "@/lib/supabase-server"

export async function POST(req: NextRequest) {
  try {
    const sb = await createClientServer()
    
    // Check if appointments table exists, if not create it
    const { data, error } = await sb
      .from('appointments')
      .select('count')
      .limit(1)
    
    if (error && error.message.includes('relation "public.appointments" does not exist')) {
      // Table doesn't exist, provide helpful instructions
      return NextResponse.json({
        success: false,
        message: 'Database tables need to be created',
        instructions: 'Please run the SQL schema in your Supabase dashboard',
        sqlFile: 'supabase.sql',
        error: 'Tables not found'
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database is properly configured',
      tablesFound: !error
    })
    
  } catch (error) {
    console.error('Database setup check error:', error)
    return NextResponse.json({
      success: false,
      message: 'Error checking database configuration',
      error: error
    }, { status: 500 })
  }
}
