import { NextRequest, NextResponse } from 'next/server';
import { formidable } from 'formidable';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configurazione Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || ''
});

// Configurazione per non utilizzare bodyParser di Next.js
export const config = {
  api: {
    bodyParser: false,
  },
};

// Questo approccio con formidable non funzionerà in App Router, quindi useremo l'API FormData nativa
export async function POST(request: NextRequest) {
  try {
    // Estrai i dati multipart dalla richiesta
    const formData = await request.formData();
    
    // Ottieni il file dal formData
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'Nessun file caricato'
      }, { status: 400 });
    }
    
    // Verifica che sia un PDF
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ 
        success: false, 
        error: 'Il file deve essere in formato PDF' 
      }, { status: 400 });
    }
    
    // Estrai informazioni dal file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Crea un file temporaneo
    const tempFilePath = `/tmp/${file.name}`;
    fs.writeFileSync(tempFilePath, buffer);
    
    // Estrai il codice della lingua dai campi
    const languageCode = formData.get('languageCode')?.toString() || 'it';
    const restaurantName = formData.get('restaurantName')?.toString() || 'restaurant';
    
    // Genera un nome file sicuro
    const safeFileName = `${restaurantName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;
    
    // Carica il file su Cloudinary
    console.log('Inizio upload su Cloudinary', { tempFilePath, safeFileName });
    const cloudinaryResponse = await cloudinary.uploader.upload(tempFilePath, {
      public_id: safeFileName,
      folder: 'menu-pdf',
      resource_type: 'raw',
      type: 'upload',
      format: 'pdf',
      access_mode: 'public',
      use_filename: true,
      overwrite: true
    });
    
    // Log della risposta completa di Cloudinary
    console.log('Risposta di Cloudinary:', JSON.stringify(cloudinaryResponse, null, 2));
    
    // Elimina il file temporaneo
    fs.unlinkSync(tempFilePath);
    
    // Costruisci l'URL pubblico per il PDF
    const publicUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/menu-pdf/${safeFileName}.pdf`;
    
    // Restituisci i dati del file caricato con URL pubblico
    return NextResponse.json({
      success: true,
      file: {
        url: publicUrl,
        originalName: file.name,
        size: file.size,
        languageCode: languageCode,
        fileName: cloudinaryResponse.public_id,
        publicId: cloudinaryResponse.public_id
      }
    });
  } catch (error: any) {
    console.error('Errore durante l\'upload del file:', error);
    return NextResponse.json({
      success: false,
      error: 'Errore durante l\'upload del file',
      details: error.message
    }, { status: 500 });
  }
} 