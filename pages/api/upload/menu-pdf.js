import formidable from 'formidable';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configurazione Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Necessario per il parsing dei form multipart con Next.js
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Controlla che sia una richiesta POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Metodo non consentito' });
  }

  try {
    // Parsing del form con formidable
    const form = new formidable.IncomingForm();
    
    // Utilizza una Promise per gestire il parsing del form
    const formData = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });
    
    const { fields, files } = formData;
    const file = files.file;
    
    if (!file) {
      return res.status(400).json({ success: false, error: 'Nessun file caricato' });
    }
    
    // Estrai informazioni dal file
    const filePath = file.filepath;
    const originalName = file.originalFilename;
    const mimeType = file.mimetype;
    
    // Verifica che sia un PDF
    if (mimeType !== 'application/pdf') {
      return res.status(400).json({ 
        success: false, 
        error: 'Il file deve essere in formato PDF' 
      });
    }
    
    // Estrai il codice della lingua dai campi
    const languageCode = fields.languageCode || 'it';
    const restaurantName = fields.restaurantName || 'restaurant';
    
    // Genera un nome file sicuro
    const safeFileName = `${restaurantName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;
    
    // Carica il file su Cloudinary
    const cloudinaryResponse = await cloudinary.uploader.upload(filePath, {
      public_id: safeFileName,
      folder: 'menu-pdf',
      resource_type: 'raw',
      format: 'pdf'
    });
    
    // Elimina il file temporaneo
    fs.unlinkSync(filePath);
    
    // Restituisci i dati del file caricato
    return res.status(200).json({
      success: true,
      file: {
        url: cloudinaryResponse.secure_url,
        originalName: originalName,
        size: file.size,
        languageCode: languageCode,
        fileName: cloudinaryResponse.public_id,
        publicId: cloudinaryResponse.public_id
      }
    });
  } catch (error) {
    console.error('Errore durante l\'upload del file:', error);
    return res.status(500).json({
      success: false,
      error: 'Errore durante l\'upload del file',
      details: error.message
    });
  }
} 