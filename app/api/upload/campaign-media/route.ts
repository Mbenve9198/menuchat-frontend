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
      // Per i video WhatsApp, useremo resource_type: 'raw' per evitare il problema del Content-Type
      resourceType = optimizeForWhatsApp ? 'raw' : 'video';
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
    
    // Se è un video per WhatsApp, dobbiamo eseguire due passaggi:
    // 1) Caricarlo come video e applicare le trasformazioni
    // 2) Poi caricarlo come raw per avere un Content-Type pulito
    if (fileType === 'video' && optimizeForWhatsApp) {
      try {
        console.log('Video per WhatsApp: processo in due fasi per Content-Type pulito');
        
        // Passo 1: Carica come video per la trascodifica
        console.log('Fase 1: Caricamento come video per trascodifica');
        const videoUploadOptions = {
          public_id: `${safeFileName}_processing`,
          folder: 'campaign-media',
          resource_type: 'video' as 'video',
          type: 'upload',
          format: 'mp4',
          transformation: [
            {quality: 70, video_codec: 'h264:baseline:3.1', audio_codec: 'aac', bit_rate: '2m', flags: 'faststart'}
          ]
        };
        
        console.log('Opzioni di caricamento video:', videoUploadOptions);
        const videoResult = await cloudinary.uploader.upload(tempFilePath, videoUploadOptions);
        console.log('Risultato trascodifica video:', videoResult.secure_url);
        
        // Pausa breve per assicurarsi che la trascodifica sia completata
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Ottieni l'URL del video trascodificato
        const transcodedUrl = videoResult.secure_url;
        
        // Passo 2: Scarica il video trascodificato e ricaricalo come raw
        console.log('Fase 2: Ricaricamento come raw con MIME type pulito');
        
        // Crea un file temporaneo per il video trascodificato
        const axios = (await import('axios')).default;
        const response = await axios.get(transcodedUrl, { responseType: 'arraybuffer' });
        const transcodedBuffer = Buffer.from(response.data);
        const transcodedFilePath = `/tmp/${safeFileName}_transcoded.mp4`;
        fs.writeFileSync(transcodedFilePath, transcodedBuffer);
        
        // Carica come raw con mime_type esplicito
        const rawUploadOptions = {
          public_id: `${safeFileName}_whatsapp_optimized`,
          folder: 'campaign-media',
          resource_type: 'raw' as 'raw',
          type: 'upload',
          mime_type: 'video/mp4' // Questo garantisce un Content-Type pulito
        };
        
        console.log('Opzioni di caricamento raw:', rawUploadOptions);
        const rawResult = await cloudinary.uploader.upload(transcodedFilePath, rawUploadOptions);
        console.log('Risultato caricamento raw:', rawResult.secure_url);
        
        // Pulisci i file temporanei
        fs.unlinkSync(transcodedFilePath);
        
        // Usa l'URL pulito
        let mediaUrl = rawResult.secure_url;
        
        // Assicurati che termini con .mp4
        if (!mediaUrl.endsWith('.mp4')) {
          mediaUrl = `${mediaUrl}.mp4`;
          console.log('URL corretto a .mp4:', mediaUrl);
        }
        
        console.log('URL finale del video WhatsApp ottimizzato:', mediaUrl);
        
        // Verifica l'header Content-Type con una richiesta HEAD
        try {
          const headResponse = await axios.head(mediaUrl);
          const contentType = headResponse.headers['content-type'];
          console.log('Content-Type verificato:', contentType);
          
          if (contentType && contentType.includes('codecs=')) {
            console.warn('⚠️ Attenzione: Content-Type contiene ancora parametri codec:', contentType);
          }
        } catch (headError: any) {
          console.warn('Non è stato possibile verificare il Content-Type:', headError.message);
        }
        
        // Restituisci i dati del file caricato
        fs.unlinkSync(tempFilePath); // Elimina il file temporaneo originale
        return NextResponse.json({
          success: true,
          file: {
            url: mediaUrl,
            originalName: file.name,
            size: file.size,
            format: 'mp4',
            resourceType: 'video', // Per il frontend, è comunque un video
            fileName: rawResult.public_id,
            publicId: rawResult.public_id
          }
        });
      } catch (processingError) {
        console.error('Errore nella lavorazione del video WhatsApp:', processingError);
        // Continuiamo con l'upload normale come fallback
      }
    }
    
    // Opzioni di upload standard (per i casi non WhatsApp o fallback)
    const uploadOptions: any = {
      public_id: safeFileName,
      folder: 'campaign-media',
      resource_type: resourceType,
      type: 'upload'
    };
    
    // Aggiungi MIME type se è raw
    if (resourceType === 'raw' && fileType === 'video') {
      uploadOptions.mime_type = 'video/mp4';
    }
    
    // Per i video normali (non WhatsApp) imposta il formato mp4
    if (resourceType === 'video') {
      uploadOptions.format = 'mp4';
    }
    
    // Carica il file su Cloudinary
    console.log('Inizio upload standard su Cloudinary', { 
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