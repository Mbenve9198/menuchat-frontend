import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Importa il client ImageKit dal backend (o ridefiniamo qui)
const ImageKit = require('imagekit');

// Configurazione ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || 'your_public_key',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || 'your_private_key',
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/your_imagekit_id/'
});

// Helper per determinare il tipo di file e cartella
const getFileTypeAndFolder = (filename: string, mimetype: string) => {
  const isVideo = mimetype.startsWith('video/');
  const isImage = mimetype.startsWith('image/');
  const isPdf = mimetype === 'application/pdf';
  
  let fileType = 'raw';
  let folder = 'campaign-media/misc';
  
  if (isVideo) {
    fileType = 'video';
    folder = 'campaign-media/videos';
  } else if (isImage) {
    fileType = 'image';
    folder = 'campaign-media/images';
  } else if (isPdf) {
    fileType = 'raw';
    folder = 'campaign-media/pdfs';
  }
  
  return { fileType, folder, isVideo, isImage, isPdf };
};

// Helper per generare nome file unico
const generateFileName = (originalName: string, campaignType: string = 'campaign') => {
  const sanitizedType = campaignType.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const fileExtension = path.extname(originalName);
  const baseName = path.basename(originalName, fileExtension);
  const timestamp = Date.now();
  
  return `${sanitizedType}-${timestamp}-${baseName}`;
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const campaignType = formData.get('campaignType') as string || 'campaign';
    const optimizeForWhatsApp = formData.get('optimizeForWhatsApp') === 'true';

    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'Nessun file trovato nella richiesta'
      }, { status: 400 });
    }

    console.log('📤 Inizio upload su ImageKit:', {
      fileName: file.name,
      size: file.size,
      type: file.type,
      campaignType,
      optimizeForWhatsApp
    });

    // Determina tipo di file e cartella
    const { fileType, folder, isVideo, isImage, isPdf } = getFileTypeAndFolder(file.name, file.type);
    
    // Crea nome file unico
    const fileName = generateFileName(file.name, campaignType);
    
    // Converte il file in buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    console.log(`📁 Upload in cartella: ${folder}, tipo: ${fileType}, nome: ${fileName}`);
    
    // Prepara le opzioni di upload per ImageKit
    const uploadOptions: any = {
      file: buffer,
      fileName: fileName,
      folder: folder,
      customMetadata: {
        originalName: file.name,
        campaignType: campaignType,
        optimizedForWhatsApp: optimizeForWhatsApp.toString(),
        uploadTimestamp: Date.now().toString()
      }
    };

    // Se è un video e serve ottimizzazione per WhatsApp, aggiungi trasformazioni
    if (isVideo && optimizeForWhatsApp) {
      uploadOptions.transformation = {
        post: [
          {
            format: 'mp4',
            videoCodec: 'h264',
            audioCodec: 'aac',
            quality: 80
          }
        ]
      };
      console.log('🎬 Applicando ottimizzazioni video per WhatsApp');
    }
    
    // Upload su ImageKit
    const imagekitResult = await imagekit.upload(uploadOptions);
    
    console.log('✅ Upload ImageKit completato:', {
      url: imagekitResult.url,
      fileId: imagekitResult.fileId,
      size: imagekitResult.size
    });
    
    // Test dell'URL finale se è un video
    if (isVideo) {
      console.log('🎬 Verifica accessibilità URL video:', imagekitResult.url);
      
      try {
        const testResponse = await fetch(imagekitResult.url, { 
          method: 'HEAD',
          signal: AbortSignal.timeout(10000)
        });
        
        if (testResponse.ok) {
          console.log('🎬 ✅ URL video accessibile - Status:', testResponse.status);
          console.log('🎬 ✅ Content-Type:', testResponse.headers.get('content-type'));
        } else {
          console.warn('🎬 ⚠️ URL video restituisce status:', testResponse.status);
        }
        
      } catch (testError) {
        console.error('🎬 ❌ Errore test URL video:', testError);
        
        return NextResponse.json({
          success: false,
          error: 'URL video non accessibile dopo l\'upload',
          details: {
            url: imagekitResult.url,
            error: testError instanceof Error ? testError.message : 'Errore sconosciuto',
            fileId: imagekitResult.fileId
          }
        }, { status: 500 });
      }
    }
    
    // Restituisci i dati del file caricato
    return NextResponse.json({
      success: true,
      file: {
        url: imagekitResult.url,
        originalName: file.name,
        size: file.size,
        format: isVideo ? 'mp4' : isPdf ? 'pdf' : imagekitResult.fileType,
        resourceType: fileType,
        fileName: imagekitResult.name,
        publicId: imagekitResult.fileId,
        optimizedForWhatsApp: isVideo && optimizeForWhatsApp,
        isVideo: isVideo
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