import { NextRequest, NextResponse } from 'next/server';

// Importa il client ImageKit
const ImageKit = require('imagekit');

// Configurazione ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || 'your_public_key',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || 'your_private_key',
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/your_imagekit_id/'
});

// Helper per generare nome file unico per menu PDF
const generateMenuPdfFileName = (originalName: string, restaurantName: string = 'restaurant') => {
  const sanitizedRestaurantName = restaurantName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const timestamp = Date.now();
  return `menu-${sanitizedRestaurantName}-${timestamp}`;
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const restaurantId = formData.get('restaurantId') as string;
    const menuId = formData.get('menuId') as string;
    const languageCode = formData.get('languageCode') as string || 'it';
    const restaurantName = formData.get('restaurantName') as string || 'restaurant';

    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'Nessun file trovato nella richiesta'
      }, { status: 400 });
    }

    // Verifica che sia un PDF
    if (file.type !== 'application/pdf') {
      return NextResponse.json({
        success: false,
        error: 'Solo file PDF sono accettati'
      }, { status: 400 });
    }

    // Verifica dimensione (15MB max per PDF)
    const maxSize = 15 * 1024 * 1024; // 15MB
    if (file.size > maxSize) {
      return NextResponse.json({
        success: false,
        error: 'Il file PDF è troppo grande. La dimensione massima è 15MB'
      }, { status: 400 });
    }

    console.log('📄 Inizio upload PDF menu su ImageKit:', {
      fileName: file.name,
      size: file.size,
      restaurantId,
      menuId,
      languageCode
    });

    // Converte il file in buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Genera nome file unico
    const fileName = generateMenuPdfFileName(file.name, restaurantName);
    
    // Opzioni di upload per ImageKit
    const uploadOptions = {
      file: buffer,
      fileName: fileName,
      folder: 'menu-pdf',
      customMetadata: {
        originalName: file.name,
        restaurantId: restaurantId || '',
        menuId: menuId || '',
        languageCode: languageCode,
        restaurantName: restaurantName,
        uploadTimestamp: Date.now().toString()
      }
    };
    
    console.log(`📁 Upload PDF in cartella menu-pdf, nome: ${fileName}`);
    
    // Upload su ImageKit
    const imagekitResult = await imagekit.upload(uploadOptions);
    
    console.log('✅ Upload PDF completato su ImageKit:', {
      url: imagekitResult.url,
      fileId: imagekitResult.fileId,
      size: imagekitResult.size
    });
    
    // Se è stata fornita l'informazione del menu, possiamo aggiornare il database
    // (questa parte potrebbe essere spostata nel controller backend)
    
    // Restituisci i dati del file caricato
    return NextResponse.json({
      success: true,
      file: {
        url: imagekitResult.url,
        originalName: file.name,
        size: file.size,
        languageCode: languageCode,
        fileName: imagekitResult.name,
        publicId: imagekitResult.fileId,
        restaurantId: restaurantId,
        menuId: menuId
      }
    });
  } catch (error: any) {
    console.error('Errore durante l\'upload del PDF menu:', error);
    return NextResponse.json({
      success: false,
      error: 'Errore durante l\'upload del PDF menu',
      details: error.message
    }, { status: 500 });
  }
} 