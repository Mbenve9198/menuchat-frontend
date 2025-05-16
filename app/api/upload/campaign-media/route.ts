import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configurazione Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || ''
});

// Configurazione per non utilizzare bodyParser di Next.js e per estendere il timeout
export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
  maxDuration: 60, // Impostazione del timeout massimo a 60 secondi (massimo consentito da Vercel)
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
      
      // Forziamo la trasformazione durante l'upload iniziale
      // La compatibilità con WhatsApp è essenziale
      uploadOptions.resource_type = 'video';
      
      // Aggiungiamo esplicitamente i parametri di trasformazione necessari
      // per garantire la compatibilità con WhatsApp
      uploadOptions.eager = [
        {
          video_codec: 'h264', // Codec H.264 richiesto da WhatsApp
          audio_codec: 'aac',  // Audio codec AAC compatibile
          format: 'mp4'        // Formato MP4 supportato
        }
      ];
      
      // Forziamo l'uso del codec video corretto
      uploadOptions.video_codec = 'h264';
      
      // Trasformazione tramite URL string di Cloudinary
      uploadOptions.raw_transformation = 'vc_h264,ac_aac/f_mp4';
      
      console.log('Parametri di trasformazione video:', JSON.stringify(uploadOptions, null, 2));
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
    
    // Se si tratta di un video, assicuriamoci di usare l'URL trasformato
    if (resourceType === 'video') {
      console.log('Ottimizzando URL video per WhatsApp');
      
      // Se abbiamo una trasformazione eager, usiamo quell'URL
      if (cloudinaryResponse.eager && cloudinaryResponse.eager.length > 0) {
        mediaUrl = cloudinaryResponse.eager[0].secure_url;
        console.log('Usando URL video trasformato da eager:', mediaUrl);
      } else {
        // Altrimenti, aggiungiamo manualmente i parametri di trasformazione all'URL
        // Formato: https://res.cloudinary.com/cloud_name/video/upload/vc_h264,ac_aac/v123456/public_id.mp4
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME || '';
        
        // Costruiamo l'URL con i parametri di trasformazione
        const urlParts = mediaUrl.split('/upload/');
        if (urlParts.length === 2) {
          mediaUrl = `${urlParts[0]}/upload/vc_h264,ac_aac,f_mp4/${urlParts[1]}`;
          console.log('URL video con parametri di trasformazione:', mediaUrl);
        } else {
          // Se non riusciamo a costruire l'URL, usiamo almeno l'URL formato trasformato di Cloudinary
          mediaUrl = `https://res.cloudinary.com/${cloudName}/video/upload/vc_h264,ac_aac,f_mp4/${cloudinaryResponse.public_id}.mp4`;
          console.log('URL video costruito manualmente:', mediaUrl);
        }
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