// api/chat.js - Vercel Serverless Function

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { question, max_sentences = 2 } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question requise' });
    }

    const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
    
    if (!MISTRAL_API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    // Prompt système
    const systemPrompt = `Tu es Curiosity, un assistant culturel français érudit et bienveillant.

RÈGLES STRICTES :
- Réponds en MAXIMUM ${max_sentences} phrases courtes et claires
- Spécialités : histoire, philosophie, arts, culture française
- Ton : bienveillant, précis, cultivé
- TOUJOURS citer tes sources entre parenthèses : (Source: Wikipédia) ou (Selon Voltaire)
- Si demande de soutien psychologique : redirige vers professionnels de santé
- Fact-checking systématique : ne donne que des infos vérifiées

Réponds maintenant à cette question :`;

    // Appel Mistral API
    const mistralResponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question }
        ],
        temperature: 0.7,
        max_tokens: 200
      })
    });

    if (!mistralResponse.ok) {
      throw new Error('Mistral API error');
    }

    const data = await mistralResponse.json();
    const answer = data.choices[0].message.content;

    // Extraction sources
    const sourcePatterns = [
      /\(Source:\s*([^)]+)\)/gi,
      /\(Selon\s*([^)]+)\)/gi,
      /\(D'après\s*([^)]+)\)/gi
    ];

    const sources = [];
    sourcePatterns.forEach(pattern => {
      const matches = answer.matchAll(pattern);
      for (const match of matches) {
        sources.push(match[1].trim());
      }
    });

    return res.status(200).json({
      answer: answer,
      sources: sources.length > 0 ? sources : ['Connaissances générales'],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Erreur serveur',
      message: error.message 
    });
  }
}
