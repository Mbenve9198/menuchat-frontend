import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    
    // Verifica autenticazione
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Non autorizzato" },
        { status: 401 }
      );
    }
    
    const { prompt, restaurantId } = await req.json();
    
    if (!prompt) {
      return NextResponse.json(
        { success: false, error: "Prompt è richiesto" },
        { status: 400 }
      );
    }

    console.log("Inoltro richiesta di generazione immagine al backend");
    console.log("Ristorante ID:", restaurantId);
    console.log("Prompt:", prompt);
    
    // Determina l'URL del backend
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    
    // Inoltra la richiesta al backend
    const response = await fetch(`${backendUrl}/api/ai/generate-image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.accessToken}`
      },
      body: JSON.stringify({
        prompt,
        restaurantId
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Errore dal backend:", response.status, errorText);
      throw new Error(`Errore dal backend: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log("Risposta dal backend:", data.success);
    
    return NextResponse.json(data);
    
  } catch (error: any) {
    console.error("Errore nella generazione dell'immagine:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Errore durante la generazione dell'immagine" 
      },
      { status: 500 }
    );
  }
} 