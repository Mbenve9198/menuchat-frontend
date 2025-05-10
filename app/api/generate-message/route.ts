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
    
    const { campaignType, language, objective, restaurantId } = await req.json();
    
    if (!campaignType) {
      return NextResponse.json(
        { success: false, error: "Il tipo di campagna è richiesto" },
        { status: 400 }
      );
    }

    console.log("Inoltro richiesta di generazione messaggio al backend");
    console.log("Tipo di campagna:", campaignType);
    console.log("Lingua:", language);
    console.log("Ristorante ID:", restaurantId);
    
    // Determina l'URL del backend
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    
    // Inoltra la richiesta al backend
    const response = await fetch(`${backendUrl}/api/ai/generate-message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.accessToken}`
      },
      body: JSON.stringify({
        campaignType,
        language,
        objective,
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
    console.error("Errore nella generazione del messaggio:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Errore durante la generazione del messaggio" 
      },
      { status: 500 }
    );
  }
} 