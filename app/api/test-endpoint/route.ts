import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  return NextResponse.json({ 
    success: true, 
    message: "Test endpoint funzionante",
    timestamp: new Date().toISOString()
  });
}

export async function GET(request: Request) {
  return NextResponse.json({ 
    success: true, 
    message: "Test endpoint funzionante (GET)",
    timestamp: new Date().toISOString()
  });
} 