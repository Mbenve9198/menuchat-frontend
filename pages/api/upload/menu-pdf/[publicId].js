import { v2 as cloudinary } from 'cloudinary';

// Configurazione Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export default async function handler(req, res) {
  // Controlla che sia una richiesta DELETE
  if (req.method !== 'DELETE') {
    return res.status(405).json({ success: false, error: 'Metodo non consentito' });
  }

  try {
    const { publicId } = req.query;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        error: 'ID pubblico del file non fornito'
      });
    }

    // Elimina il file da Cloudinary
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'raw'
    });

    if (result.result !== 'ok') {
      return res.status(400).json({
        success: false,
        error: 'Impossibile eliminare il file',
        details: result
      });
    }

    return res.status(200).json({
      success: true,
      message: 'File eliminato con successo'
    });
  } catch (error) {
    console.error('Errore durante l\'eliminazione del file:', error);
    return res.status(500).json({
      success: false,
      error: 'Errore durante l\'eliminazione del file',
      details: error.message
    });
  }
} 