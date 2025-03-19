import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      restaurantName,
      restaurantDetails,
      reviewLink,
      modelId = "claude-3-7-sonnet-20250219"
    } = body;
    
    if (!restaurantDetails) {
      return NextResponse.json({
        success: false,
        error: 'Restaurant details are required'
      }, { status: 400 });
    }

    const promptContent = `Create 3 different review request messages for a restaurant. Each should be unique but follow these guidelines:

Restaurant Name: ${restaurantDetails.name}
Rating: ${restaurantDetails.rating}/5 (${restaurantDetails.ratingsTotal} reviews)
Cuisine: ${restaurantDetails.cuisineTypes?.join(', ') || 'Various'}

Requirements for EACH template:
1. Be friendly and conversational
2. Keep each message to 120-150 characters
3. Ask customers to leave a review
4. Don't include the review link directly in the message (it will be added automatically)
5. Each template should have a different style:
   - Template 1: Direct and simple
   - Template 2: Emphasize how feedback helps the restaurant
   - Template 3: Thank the customer for their order first

Response format must be EXACTLY:
Template 1: [first template text]
Template 2: [second template text]
Template 3: [third template text]

Do not include the review link or any placeholders for it in the templates.`;

    // Generate review templates using Claude
    const response = await anthropic.messages.create({
      model: modelId,
      max_tokens: 500,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: promptContent
        }
      ]
    });

    // Extract templates from response
    const fullText = response.content[0].text;
    const templates = fullText
      .split(/Template \d+: /)
      .filter(text => text.trim().length > 0)
      .map(text => text.trim());

    return NextResponse.json({ 
      success: true, 
      templates: templates
    });
  } catch (error) {
    console.error('Error generating review templates:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error generating review templates',
      details: error.message 
    }, { status: 500 });
  }
} 