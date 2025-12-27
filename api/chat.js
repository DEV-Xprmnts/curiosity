// api/chat.js - Curiosity v2.0 Backend avec capacités étendues

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
    const { question, max_sentences = 2, history = [] } = req.body;

    if (!question || question.trim().length === 0) {
      return res.status(400).json({ error: 'Question requise' });
    }

    const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
    
    if (!MISTRAL_API_KEY) {
      console.error('MISTRAL_API_KEY not configured');
      return res.status(500).json({ error: 'Configuration error' });
    }

    // Détection du type de requête pour activer web_search
    const needsRealTimeData = detectRealTimeNeed(question);

    // System prompt enrichi
    const systemPrompt = `Tu es Curiosity, un oracle culturel français omniscient et bienveillant.

**TES CAPACITÉS :**
- Expert en histoire, philosophie, arts, culture française
- Expert en gastronomie, tourisme, patrimoine culturel
- Accès aux données en temps réel : météo, heure, cours des cryptomonnaies, horaires de transports
- Guide touristique et culinaire
- Mémoire conversationnelle (tu te souviens des échanges précédents)

**RÈGLES STRICTES :**
- Réponds en MAXIMUM ${max_sentences} phrases courtes et claires
- Ton : bienveillant, érudit, accessible
- TOUJOURS citer tes sources entre parenthèses : (Source: Wikipédia) ou (Météo France)
- Pour les questions nécessitant des données en temps réel (météo, heure, Bitcoin, etc.), utilise web_search
- Si demande de soutien psychologique : redirige vers professionnels de santé
- Fact-checking systématique

**EXEMPLES DE REQUÊTES À GÉRER :**
- "Quelle heure est-il ?" → Utilise web_search pour l'heure actuelle
- "Quel temps fait-il à Paris ?" → web_search météo Paris
- "Cours du Bitcoin ?" → web_search Bitcoin price
- "Comment aller de Toulouse à Brocéliande ?" → web_search itinéraire + conseils
- "Recette bœuf bourguignon" → Fournis une recette authentique
- "Qui était Voltaire ?" → Réponds avec tes connaissances + sources

Réponds maintenant à cette question :`;

    // Construction des messages avec historique
    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    // Ajouter l'historique (max 6 derniers messages)
    if (history && history.length > 0) {
      messages.push(...history.slice(-6));
    }

    // Ajouter la question actuelle
    messages.push({ role: 'user', content: question });

    // Préparer les tools (web_search si nécessaire)
    const tools = needsRealTimeData ? [
      {
        type: "web_search_20250305",
        name: "web_search"
      }
    ] : [];

    // Appel API Mistral avec web_search
    const mistralResponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: messages,
        temperature: 0.7,
        max_tokens: max_sentences === 2 ? 150 : 400,
        top_p: 1,
        ...(tools.length > 0 && { tools: tools })
      })
    });

    if (!mistralResponse.ok) {
      const errorData = await mistralResponse.json().catch(() => ({}));
      console.error('Mistral API error:', errorData);
      return res.status(500).json({ 
        error: 'Mistral API error',
        details: errorData.message || 'Unknown error'
      });
    }

    const data = await mistralResponse.json();
    
    // Extraire la réponse (gérer les tool_use si web_search a été utilisé)
    let answer = '';
    const sources = [];

    if (data.choices && data.choices[0] && data.choices[0].message) {
      const message = data.choices[0].message;
      
      // Si content est un array (tool use)
      if (Array.isArray(message.content)) {
        answer = message.content
          .filter(item => item.type === 'text')
          .map(item => item.text)
          .join(' ');
      } else {
        answer = message.content;
      }
    }

    // Extraction des sources
    const sourcePatterns = [
      /\(Source:\s*([^)]+)\)/gi,
      /\(Selon\s*([^)]+)\)/gi,
      /\(D'après\s*([^)]+)\)/gi,
      /\(Météo\s*([^)]+)\)/gi
    ];

    sourcePatterns.forEach(pattern => {
      const matches = answer.matchAll(pattern);
      for (const match of matches) {
        sources.push(match[1].trim());
      }
    });

    // Log pour monitoring
    console.log(`[${new Date().toISOString()}] Question: "${question.substring(0, 50)}..." | Success | Tools: ${tools.length > 0 ? 'web_search' : 'none'}`);

    return res.status(200).json({
      answer: answer,
      sources: sources.length > 0 ? sources : ['Connaissances générales'],
      timestamp: new Date().toISOString(),
      used_search: tools.length > 0
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: 'Erreur serveur',
      message: error.message 
    });
  }
}

// Fonction de détection du besoin de données en temps réel
function detectRealTimeNeed(question) {
  const q = question.toLowerCase();
  
  const realTimeKeywords = [
    // Météo
    'météo', 'temps qu\'il fait', 'température', 'pluie', 'soleil', 'weather',
    // Heure/Date
    'quelle heure', 'quel jour', 'date', 'aujourd\'hui',
    // Finance
    'bitcoin', 'crypto', 'cours', 'bourse', 'action', 'euro', 'dollar',
    // Transport
    'vol', 'avion', 'train', 'horaire', 'retard', 'itinéraire',
    // Actualité
    'actualité', 'news', 'aujourd\'hui', 'récent',
    // Navigation
    'comment aller', 'trajet', 'distance', 'route'
  ];

  return realTimeKeywords.some(keyword => q.includes(keyword));
}
