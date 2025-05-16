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
    
    let actualMaxSize = maxSize
    if (resourceType === 'video') {
      actualMaxSize = 15 * 1024 * 1024; // Limitiamo a 15MB per i video (invece di 30MB) per evitare timeout
      console.log('Limitazione dimensione video a 15MB per evitare timeout durante la conversione');
    } else if (resourceType === 'raw') { 
      actualMaxSize = 15 * 1024 * 1024; // 15MB per PDF
    }
    
    if (file.size > actualMaxSize) {
      const sizeInMB = Math.round(actualMaxSize / (1024 * 1024));
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
    const safeFileName = `campaign-${campaignType}-${Date.now()}`;
    
    let mediaUrl;
    
    // Upload specializzato per video - con trasformazione immediata
    if (resourceType === 'video') {
      console.log('Upload video con trasformazione immediata per WhatsApp');
      
      // Per i video, utilizziamo opzioni minime ma essenziali per la conversione
      const videoUploadOptions = {
        public_id: safeFileName,
        folder: 'campaign-media',
        resource_type: 'video' as 'video',
        eager: [{ 
          format: 'mp4', 
          video_codec: 'h264',
          audio_codec: 'aac'
        }],
        eager_async: false, // Importante: forza la trasformazione sincrona
        transformation: [{ 
          video_codec: 'h264',
          audio_codec: 'aac'
        }]
      };
      
      // Upload video con trasformazione immediata
      try {
        const videoResponse = await cloudinary.uploader.upload(tempFilePath, videoUploadOptions);
        
        // Usa l'URL della versione trasformata
        if (videoResponse.eager && videoResponse.eager.length > 0) {
          mediaUrl = videoResponse.eager[0].secure_url;
          console.log('Video convertito con successo:', mediaUrl);
        } else {
          // Fallback all'URL originale con parametri di trasformazione
          mediaUrl = videoResponse.secure_url;
          const urlParts = mediaUrl.split('/upload/');
          if (urlParts.length === 2) {
            mediaUrl = `${urlParts[0]}/upload/vc_h264,ac_aac,f_mp4/${urlParts[1]}`;
          }
          console.log('Fallback a URL con parametri di trasformazione:', mediaUrl);
        }
      } catch (videoError) {
        console.error('Errore nella trasformazione del video:', videoError);
        throw new Error('Errore nella conversione del video per WhatsApp');
      }
    } else {
      // Upload standard per immagini e PDF
      const uploadOptions = {
        public_id: safeFileName,
        folder: 'campaign-media',
        resource_type: resourceType
      };
      
      // Upload normale per altri tipi di file
      const response = await cloudinary.uploader.upload(tempFilePath, uploadOptions);
      mediaUrl = response.secure_url;
    }
    
    // Elimina il file temporaneo
    fs.unlinkSync(tempFilePath);
    
    // Restituisci i dati del file caricato
    return NextResponse.json({
      success: true,
      file: {
        url: mediaUrl,
        originalName: file.name,
        size: file.size,
        mediaType: fileType,
        fileName: safeFileName,
        publicId: safeFileName
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