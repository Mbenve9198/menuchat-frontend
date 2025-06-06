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
    
    // Ottieni parametri di trasformazione e ottimizzazione
    const optimizeForWhatsApp = formData.get('optimizeForWhatsApp')?.toString() === 'true';
    const noTransformations = formData.get('noTransformations')?.toString() === 'true';
    
    console.log('Parametri upload:', {
      optimizeForWhatsApp,
      noTransformations,
      fileType: file.type,
      fileName: file.name
    });
    
    // Determina il tipo di risorsa basato sul MIME type
    let resourceType: 'image' | 'video' | 'raw' | 'auto' = 'image';
    let fileType = 'image';
    
    if (file.type.startsWith('video/')) {
      // Per tutti i video, usa sempre conversione standard in MP4
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
    
    if (fileType === 'video') {
      maxSize = 30 * 1024 * 1024; // 30MB per video
    } else if (fileType === 'pdf') { 
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
    let fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    
    // Se è un video e ottimizziamo per WhatsApp, forza estensione mp4
    if (fileType === 'video') {
      fileExtension = 'mp4';
    }
    
    const timestamp = Date.now();
    const safeFileName = `campaign-${campaignType}-${timestamp}`;
    
    // Opzioni di upload standard - SEMPRE per tutti i video
    const uploadOptions: any = {
      public_id: safeFileName,
      folder: 'campaign-media',
      resource_type: resourceType,
      type: 'upload'
    };
    
    // Per i video, imposta sempre il formato mp4 per la conversione automatica
    if (resourceType === 'video') {
      uploadOptions.format = 'mp4';
      // Aggiungi trasformazioni di base per ottimizzare per WhatsApp
      if (optimizeForWhatsApp) {
        uploadOptions.transformation = [
          { quality: 'auto:good' },
          { video_codec: 'h264' },
          { audio_codec: 'aac' }
        ];
      }
    }
    
    // Carica il file su Cloudinary
    console.log('Inizio upload su Cloudinary', { 
      tempFilePath, 
      safeFileName, 
      resourceType, 
      fileType,
      uploadOptions
    });
    
    const cloudinaryResponse = await cloudinary.uploader.upload(tempFilePath, uploadOptions);
    
    // Log della risposta completa di Cloudinary
    console.log('Risposta di Cloudinary:', JSON.stringify(cloudinaryResponse, null, 2));
    
    // Elimina il file temporaneo
    fs.unlinkSync(tempFilePath);
    
    // Ottieni l'URL e assicurati che per i video termini con .mp4
    let mediaUrl = cloudinaryResponse.secure_url;
    
    // Se è un video, assicurati che l'estensione sia .mp4
    if (fileType === 'video' && !mediaUrl.endsWith('.mp4')) {
      mediaUrl = `${mediaUrl}.mp4`;
      console.log('URL corretto a .mp4:', mediaUrl);
    }
    
    console.log('URL finale restituito al client:', mediaUrl);
    
    // Restituisci i dati del file caricato
    return NextResponse.json({
      success: true,
      file: {
        url: mediaUrl,
        originalName: file.name,
        size: file.size,
        format: fileType === 'video' ? 'mp4' : fileExtension,
        resourceType: fileType, // Usiamo fileType invece di resourceType per la risposta
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