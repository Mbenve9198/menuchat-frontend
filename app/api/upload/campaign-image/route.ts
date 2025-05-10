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
    
    // Verifica se la richiesta è multipart/form-data
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { success: false, error: "Content-Type deve essere multipart/form-data" },
        { status: 400 }
      );
    }
    
    // Leggi il form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: "Nessun file caricato" },
        { status: 400 }
      );
    }
    
    console.log("Preparazione caricamento file:", file.name, "Dimensione:", file.size, "Tipo:", file.type);
    
    // Verifica che sia un'immagine
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: "Il file deve essere un'immagine" },
        { status: 400 }
      );
    }
    
    // Determina l'URL del backend
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    
    // Crea un nuovo FormData da inviare al backend
    const backendFormData = new FormData();
    backendFormData.append("file", file);
    backendFormData.append("restaurantId", session.user.restaurantId || "");
    
    // Inoltra la richiesta al backend
    const response = await fetch(`${backendUrl}/api/upload/campaign-image`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${session.accessToken}`
      },
      body: backendFormData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Errore dal backend:", response.status, errorText);
      throw new Error(`Errore dal backend: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log("Immagine caricata tramite backend:", data.file?.url);
    
    return NextResponse.json(data);
    
  } catch (error: any) {
    console.error("Errore nel caricamento dell'immagine:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Errore durante il caricamento dell'immagine" 
      },
      { status: 500 }
    );
  }
} 