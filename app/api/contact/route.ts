import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // Super simple - always return success
  return NextResponse.json({ 
    success: true, 
    message: 'Thank you for your message! We\'ll get back to you within 24 hours.' 
  })
}
