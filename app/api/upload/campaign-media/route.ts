import { NextRequest, NextResponse } from 'next/server';
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
    
    // Determina il tipo di risorsa basato sul MIME type
    let resourceType: 'image' | 'video' | 'raw' | 'auto' = 'image';
    if (file.type.startsWith('video/')) {
      resourceType = 'video';
    } else if (!file.type.startsWith('image/')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Il file deve essere un\'immagine o un video' 
      }, { status: 400 });
    }
    
    // Verifica dimensione massima: 10MB per immagini, 30MB per video
    const maxSize = resourceType === 'image' ? 10 * 1024 * 1024 : 30 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ 
        success: false, 
        error: `Il file è troppo grande. La dimensione massima è ${resourceType === 'image' ? '10MB' : '30MB'}` 
      }, { status: 400 });
    }
    
    // Estrai informazioni dal file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Crea un file temporaneo
    const tempFilePath = `/tmp/${file.name}`;
    fs.writeFileSync(tempFilePath, buffer);
    
    // Estrai informazioni aggiuntive
    const campaignType = formData.get('campaignType')?.toString() || 'campaign';
    
    // Genera un nome file sicuro
    const fileExtension = file.name.split('.').pop() || '';
    const safeFileName = `campaign-${campaignType}-${Date.now()}.${fileExtension}`;
    
    // Carica il file su Cloudinary
    console.log('Inizio upload su Cloudinary', { tempFilePath, safeFileName, resourceType });
    const cloudinaryResponse = await cloudinary.uploader.upload(tempFilePath, {
      public_id: safeFileName.replace(`.${fileExtension}`, ''),
      folder: 'campaign-media',
      resource_type: resourceType,
      type: 'upload'
    });
    
    // Log della risposta completa di Cloudinary
    console.log('Risposta di Cloudinary:', JSON.stringify(cloudinaryResponse, null, 2));
    
    // Elimina il file temporaneo
    fs.unlinkSync(tempFilePath);
    
    // Usa l'URL sicuro fornito da Cloudinary
    const mediaUrl = cloudinaryResponse.secure_url;
    
    // Restituisci i dati del file caricato
    return NextResponse.json({
      success: true,
      file: {
        url: mediaUrl,
        originalName: file.name,
        size: file.size,
        mediaType: resourceType,
        fileName: cloudinaryResponse.public_id,
        publicId: cloudinaryResponse.public_id
      }
    });
  } catch (error: any) {
    console.error('Errore durante l\'upload del media:', error);
    return NextResponse.json({
      success: false,
      error: 'Errore durante l\'upload del media',
      details: error.message
    }, { status: 500 });
  }
} 