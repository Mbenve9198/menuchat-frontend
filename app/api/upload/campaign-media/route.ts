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
    let fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    
    // Se è un video e ottimizziamo per WhatsApp, forza estensione mp4
    if (resourceType === 'video' && optimizeForWhatsApp) {
      fileExtension = 'mp4';
    }
    
    const safeFileName = `campaign-${campaignType}-${Date.now()}.${fileExtension}`;
    
    // Opzioni di upload
    const uploadOptions: any = {
      public_id: safeFileName.replace(`.${fileExtension}`, ''),
      folder: 'campaign-media',
      resource_type: resourceType,
      type: 'upload'
    };
    
    // Se è un video per WhatsApp, forza formato mp4 e aggiungi trasformazioni
    if (resourceType === 'video' && optimizeForWhatsApp) {
      // Opzioni speciali per WhatsApp
      uploadOptions.format = 'mp4';
      
      // Per assicurare che il video abbia sia traccia video H.264 che audio AAC
      uploadOptions.transformation = [
        { quality: 70, video_codec: 'h264:baseline:3.1', audio_codec: 'aac', bit_rate: '2m', flags: 'faststart' }
      ];
      
      // Aggiungere fl_attachment per forzare Content-Type pulito
      if (!noTransformations) {
        uploadOptions.transformation.push({ flags: 'attachment' });
      }
    }
    
    // Carica il file su Cloudinary
    console.log('Inizio upload su Cloudinary', { 
      tempFilePath, 
      safeFileName, 
      resourceType, 
      fileType,
      optimizeForWhatsApp,
      noTransformations,
      uploadOptions
    });
    
    const cloudinaryResponse = await cloudinary.uploader.upload(tempFilePath, uploadOptions);
    
    // Log della risposta completa di Cloudinary
    console.log('Risposta di Cloudinary:', JSON.stringify(cloudinaryResponse, null, 2));
    
    // Elimina il file temporaneo
    fs.unlinkSync(tempFilePath);
    
    // Ottieni l'URL e assicurati che per i video termini con .mp4
    let mediaUrl = cloudinaryResponse.secure_url;
    
    // Se è un video WhatsApp, verifica che l'URL contenga fl_attachment o aggiungilo
    if (resourceType === 'video' && optimizeForWhatsApp && !mediaUrl.includes('fl_attachment') && mediaUrl.includes('/upload/')) {
      mediaUrl = mediaUrl.replace(/\/upload\//, '/upload/fl_attachment/');
      console.log('URL con fl_attachment aggiunto:', mediaUrl);
    }
    
    // Se è un video, assicurati che l'estensione sia .mp4
    if (resourceType === 'video' && !mediaUrl.endsWith('.mp4')) {
      mediaUrl = mediaUrl.replace(/\.\w+$/, '.mp4');
      console.log('URL corretto a .mp4:', mediaUrl);
    }
    
    // Per i video, verifica il Content-Type con una chiamata HEAD
    if (resourceType === 'video' && optimizeForWhatsApp) {
      try {
        const axios = require('axios');
        const response = await axios.head(mediaUrl);
        const contentType = response.headers['content-type'];
        console.log(`Verifica Content-Type dell'URL video: ${contentType}`);
        
        // Se il Content-Type è problematico, prova con upload raw
        if (contentType.includes('codecs=avc1') && !contentType.includes('mp4a.40.2')) {
          console.warn(`⚠️ Content-Type problematico: ${contentType}`);
          console.log('Tentativo di upload come raw per forzare Content-Type pulito...');
          
          // Scarica nuovamente il file per caricarlo come raw
          const { data } = await axios.get(mediaUrl, { responseType: 'arraybuffer' });
          const rawTempPath = `/tmp/raw_video_${Date.now()}.mp4`;
          fs.writeFileSync(rawTempPath, data);
          
          // Upload come raw con mime_type forzato
          const rawUploadResult = await cloudinary.uploader.upload(rawTempPath, {
            resource_type: 'raw',
            public_id: `${cloudinaryResponse.public_id}_raw`,
            folder: 'campaign-media',
            type: 'upload',
            format: 'mp4',
            access_mode: 'public',
            mime_type: 'video/mp4'
          });
          
          // Usa l'URL raw
          mediaUrl = rawUploadResult.secure_url;
          console.log('URL raw con Content-Type forzato:', mediaUrl);
          
          // Pulizia
          fs.unlinkSync(rawTempPath);
        }
      } catch (headError: any) {
        console.error('Errore nella verifica Content-Type:', headError.message);
      }
    }
    
    console.log('URL finale restituito al client:', mediaUrl);
    
    // Restituisci i dati del file caricato
    return NextResponse.json({
      success: true,
      file: {
        url: mediaUrl,
        originalName: file.name,
        size: file.size,
        format: resourceType === 'video' ? 'mp4' : fileExtension,
        resourceType,
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