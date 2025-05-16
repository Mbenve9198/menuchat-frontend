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
    let fileType = 'image';
    
    if (file.type.startsWith('video/')) {
      resourceType = 'video';
      fileType = 'video';
    } else if (file.type === 'application/pdf') {
      resourceType = 'raw'; // I PDF vanno caricati come raw in Cloudinary
      fileType = 'pdf';
    } else if (!file.type.startsWith('image/')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Il file deve essere un\'immagine, un video o un PDF' 
      }, { status: 400 });
    }
    
    // Verifica dimensione massima in base al tipo di file
    let maxSize = 10 * 1024 * 1024; // Default 10MB per immagini
    
    if (resourceType === 'video') {
      maxSize = 30 * 1024 * 1024; // 30MB per video
    } else if (resourceType === 'raw') { 
      maxSize = 15 * 1024 * 1024; // 15MB per PDF
    }
    
    if (file.size > maxSize) {
      const sizeInMB = Math.round(maxSize / (1024 * 1024));
      return NextResponse.json({ 
        success: false, 
        error: `Il file è troppo grande. La dimensione massima è ${sizeInMB}MB` 
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
    
    // Configurazione base per l'upload
    const uploadOptions = {
      public_id: safeFileName.replace(`.${fileExtension}`, ''),
      folder: 'campaign-media',
      resource_type: resourceType
    };
    
    // Carica il file su Cloudinary (senza opzioni pesanti)
    console.log('Inizio upload su Cloudinary', { tempFilePath, safeFileName, resourceType, fileType });
    const cloudinaryResponse = await cloudinary.uploader.upload(tempFilePath, uploadOptions);
    
    // Elimina il file temporaneo
    fs.unlinkSync(tempFilePath);
    
    // Prepara l'URL del media
    let mediaUrl = cloudinaryResponse.secure_url;
    
    // Per i video, modifichiamo l'URL per forzare la trasformazione lato client
    if (resourceType === 'video') {
      const urlParts = mediaUrl.split('/upload/');
      if (urlParts.length === 2) {
        // Aggiungiamo i parametri di trasformazione all'URL per garantire compatibilità WhatsApp
        mediaUrl = `${urlParts[0]}/upload/vc_h264,ac_aac,f_mp4/${urlParts[1]}`;
        console.log('URL video compatibile con WhatsApp:', mediaUrl);
      }
    }
    
    // Restituisci i dati del file caricato
    return NextResponse.json({
      success: true,
      file: {
        url: mediaUrl,
        originalName: file.name,
        size: file.size,
        mediaType: fileType,
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