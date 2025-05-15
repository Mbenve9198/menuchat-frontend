import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

// GET: ottiene tutte le campagne per il ristorante
export async function GET(request: NextRequest) {
  try {
    // Ottieni la sessione e verifica l'autenticazione
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    // Ottieni restaurantId dalla sessione
    const restaurantId = session.user.restaurantId

    if (!restaurantId) {
      return NextResponse.json(
        { success: false, error: 'ID ristorante mancante' },
        { status: 400 }
      )
    }

    // URL dell'API backend
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
    
    // Richiedi le campagne dal backend
    const response = await fetch(`${backendUrl}/api/campaign`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Errore del server' }))
      return NextResponse.json(
        { success: false, error: errorData.error || 'Errore nella richiesta delle campagne' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Errore nel recupero delle campagne:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Errore interno del server',
        details: error.message || String(error)
      },
      { status: 500 }
    )
  }
}

// POST: crea una nuova campagna
export async function POST(request: NextRequest) {
  try {
    // Ottieni la sessione e verifica l'autenticazione
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    // Ottieni i dati dalla richiesta
    const campaignData = await request.json()

    if (!campaignData) {
      return NextResponse.json(
        { success: false, error: 'Dati della campagna mancanti' },
        { status: 400 }
      )
    }

    // URL dell'API backend
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
    
    // Gestione del template: verifica o crea
    let templateId = campaignData.templateId;
    let templateType = 'CALL_TO_ACTION'; // Tipo predefinito
    let mediaUrl = null;
    let mediaType = null;
    
    // Estrai informazioni sui media dai parametri del template
    if (campaignData.templateParameters) {
      const params = campaignData.templateParameters;
      
      // Verifica se dobbiamo usare un'immagine
      if (params.useImage && params.imageUrl) {
        mediaUrl = params.imageUrl;
        
        // Determina il tipo di media in base all'URL o all'estensione
        if (params.uploadedFileType) {
          mediaType = params.uploadedFileType; // 'image', 'video', 'pdf'
        } else if (mediaUrl.match(/\.(jpg|jpeg|png|gif)$/i)) {
          mediaType = 'image';
        } else if (mediaUrl.match(/\.(mp4|mov|avi|wmv)$/i)) {
          mediaType = 'video';
        } else if (mediaUrl.match(/\.(pdf)$/i)) {
          mediaType = 'pdf';
        } else {
          // Se non riusciamo a determinare il tipo, assumiamo sia un'immagine
          mediaType = 'image';
        }
        
        // Se abbiamo un media, il tipo di template sarà MEDIA
        templateType = 'MEDIA';
      }
    }
    
    // Se abbiamo un templateId, verifichiamo che esista
    if (templateId) {
      try {
        const templateResponse = await fetch(`${backendUrl}/api/campaign-templates/${templateId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.accessToken}`
          },
          cache: 'no-store'
        });
        
        if (templateResponse.ok) {
          // Il template esiste, continuiamo
          console.log('Template trovato, ID:', templateId);
        } else {
          // Il template non esiste, lo creeremo
          templateId = null;
        }
      } catch (error) {
        console.error('Errore nella verifica del template:', error);
        templateId = null;
      }
    }
    
    // Se non abbiamo un templateId valido, crea un nuovo template
    if (!templateId) {
      // Determina il tipo di campagna
      const campaignType = campaignData.name?.toLowerCase().includes('promo') ? 'promo' : 
                         campaignData.name?.toLowerCase().includes('event') ? 'event' :
                         campaignData.name?.toLowerCase().includes('update') ? 'update' :
                         campaignData.name?.toLowerCase().includes('feedback') ? 'feedback' : 'promo';
      
      // Prepara i dati del template
      const templateData: any = {
        type: templateType,
        name: `${campaignType}_${Date.now()}`,
        language: 'it',
        campaignType: campaignType,
        whatsappCategory: campaignType === 'event' || campaignType === 'update' ? 'UTILITY' : 'MARKETING',
        components: {
          body: {
            text: campaignData.templateParameters?.message || `Campagna ${campaignType}`
          }
        },
        variables: [
          {
            index: 1,
            name: "customerName",
            example: "Cliente"
          }
        ]
      };
      
      // Se abbiamo un media, aggiungiamo le informazioni al template
      if (mediaUrl) {
        // Aggiungi l'header con il media
        templateData.components.header = {
          type: mediaType === 'video' ? 'VIDEO' : 
               mediaType === 'pdf' ? 'DOCUMENT' : 'IMAGE',
          format: mediaType === 'pdf' ? 'pdf' : 
                mediaType === 'video' ? 'mp4' : 'jpg',
          example: mediaUrl
        };
      }
      
      // Se abbiamo un CTA, aggiungiamo il bottone
      if (campaignData.templateParameters?.cta) {
        templateData.components.buttons = [
          {
            type: campaignData.templateParameters.ctaType === 'phone' ? 'PHONE' : 'URL',
            text: campaignData.templateParameters.cta,
            [campaignData.templateParameters.ctaType === 'phone' ? 'phone_number' : 'url']: 
              campaignData.templateParameters.ctaValue || 'https://example.com'
          }
        ];
      }
      
      console.log('Creazione nuovo template con dati:', JSON.stringify(templateData, null, 2));
      
      // Crea il template
      try {
        const createTemplateResponse = await fetch(`${backendUrl}/api/campaign-templates`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.accessToken}`
          },
          body: JSON.stringify(templateData)
        });
        
        if (!createTemplateResponse.ok) {
          // Se non riusciamo a creare un template personalizzato, proviamo con i template predefiniti
          console.log('Impossibile creare un template personalizzato, utilizzo predefiniti');
          
          const defaultsResponse = await fetch(`${backendUrl}/api/campaign-templates/create-defaults`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.accessToken}`
            }
          });
          
          if (!defaultsResponse.ok) {
            return NextResponse.json(
              { success: false, error: 'Impossibile creare template predefiniti' },
              { status: 500 }
            );
          }
          
          // Cerca un template predefinito compatibile
          const defaultsData = await defaultsResponse.json();
          const matchingTemplate = defaultsData.data.find(
            (t: any) => t.campaignType === campaignType
          );
          
          if (!matchingTemplate) {
            return NextResponse.json(
              { success: false, error: 'Nessun template compatibile trovato' },
              { status: 404 }
            );
          }
          
          // Usa l'ID del template predefinito
          templateId = matchingTemplate._id;
        } else {
          // Usa l'ID del template appena creato
          const templateResult = await createTemplateResponse.json();
          templateId = templateResult.data._id;
        }
      } catch (error) {
        console.error('Errore nella creazione del template:', error);
        return NextResponse.json(
          { success: false, error: 'Errore nella creazione del template' },
          { status: 500 }
        );
      }
    }
    
    // Aggiorna l'ID del template nella richiesta
    campaignData.templateId = templateId;
    
    console.log('Creazione campagna con template ID:', templateId);
    
    // Invia la richiesta di creazione al backend
    const response = await fetch(`${backendUrl}/api/campaign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`
      },
      body: JSON.stringify(campaignData)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Errore del server' }))
      return NextResponse.json(
        { success: false, error: errorData.error || 'Errore nella creazione della campagna' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Errore nella creazione della campagna:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Errore interno del server',
        details: error.message || String(error)
      },
      { status: 500 }
    )
  }
} 