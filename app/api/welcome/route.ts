import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    success: true, 
    message: "Welcome endpoint works (GET)",
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: Request) {
  try {
    // Ottieni i dati del form
    const formData = await request.json();
    
    return NextResponse.json({ 
      success: true, 
      message: "Welcome endpoint works (POST)",
      data: formData,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error processing request',
      details: error.message
    }, { status: 500 });
  }
} 