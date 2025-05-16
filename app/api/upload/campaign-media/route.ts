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
    
    // Prepara le opzioni di upload in base al tipo di file
    const uploadOptions: Record<string, any> = {
      public_id: safeFileName.replace(`.${fileExtension}`, ''),
      folder: 'campaign-media',
      resource_type: resourceType,
      type: 'upload'
    };
    
    // Per i video, aggiungi parametri di trasformazione per compatibilità WhatsApp
    if (resourceType === 'video') {
      console.log('Configurando trasformazione video per compatibilità WhatsApp');
      
      // Aggiungi opzioni di trasformazione specifiche per video WhatsApp
      uploadOptions.transformation = [
        {
          video_codec: 'h264', // Usa codec h264 (ampiamente supportato)
          audio_codec: 'aac', // Standard audio codec
          format: 'mp4', // Formato file di output
          quality: 'auto', // Regola automaticamente la qualità per ottimizzare la dimensione
          bit_rate: '1500k' // Bitrate moderato per buona qualità
        }
      ];
      
      // Settaggi specifici per garantire compatibilità con i requisiti di WhatsApp
      uploadOptions.eager = [
        {
          video_codec: 'h264',
          audio_codec: 'aac',
          format: 'mp4'
        }
      ];
      
      console.log('Opzioni trasformazione video:', JSON.stringify(uploadOptions.transformation, null, 2));
    }
    
    // Carica il file su Cloudinary
    console.log('Inizio upload su Cloudinary', { tempFilePath, safeFileName, resourceType, fileType });
    const cloudinaryResponse = await cloudinary.uploader.upload(tempFilePath, uploadOptions);
    
    // Log della risposta completa di Cloudinary
    console.log('Risposta di Cloudinary:', JSON.stringify(cloudinaryResponse, null, 2));
    
    // Elimina il file temporaneo
    fs.unlinkSync(tempFilePath);
    
    // Per i video, usa l'URL della versione trasformata se disponibile
    let mediaUrl = cloudinaryResponse.secure_url;
    
    // Se abbiamo eager transformations per i video, usa quella URL
    if (resourceType === 'video' && cloudinaryResponse.eager && cloudinaryResponse.eager.length > 0) {
      mediaUrl = cloudinaryResponse.eager[0].secure_url;
      console.log('Usando URL video trasformato:', mediaUrl);
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