import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configurazione Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || ''
});

export async function DELETE(
  request: NextRequest,
  { params }: { params: { publicId: string } }
) {
  try {
    const { publicId } = params;

    if (!publicId) {
      return NextResponse.json({
        success: false,
        error: 'ID pubblico del file non fornito'
      }, { status: 400 });
    }

    console.log('Eliminazione file da Cloudinary:', publicId);

    // Elimina il file da Cloudinary
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'raw'
    });

    if (result.result !== 'ok') {
      return NextResponse.json({
        success: false,
        error: 'Impossibile eliminare il file',
        details: result
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'File eliminato con successo'
    });
  } catch (error: any) {
    console.error('Errore durante l\'eliminazione del file:', error);
    return NextResponse.json({
      success: false,
      error: 'Errore durante l\'eliminazione del file',
      details: error.message
    }, { status: 500 });
  }
} 