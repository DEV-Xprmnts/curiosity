// 🚀 CURIOSITY BACKEND - Serveur Node.js + Express
// À déployer sur Vercel, Railway ou Render (GRATUIT)

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// ⚙️ CONFIGURATION - AJOUTEZ VOTRE CLÉ API MISTRAL ICI
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY || 'VOTRE_CLE_API_MISTRAL';
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

// 🔒 Middleware de sécurité
app.use(cors()); // Permet les requêtes depuis WordPress
app.use(express.json());

// 🛡️ Rate Limiting : 20 requêtes par minute par IP
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 20, // 20 requêtes max
    message: { error: 'Trop de requêtes, veuillez patienter.' }
});

app.use('/api/', limiter);

// 📊 Endpoint de santé
app.get('/', (req, res) => {
    res.json({ 
        status: 'online', 
        service: 'Curiosity API',
        version: '1.0.0'
    });
});

// 🧠 Endpoint principal - Chat avec Curiosity
app.post('/api/chat', async (req, res) => {
    try {
        const { question, max_sentences = 2 } = req.body;

        if (!question || question.trim().length === 0) {
            return res.status(400).json({ error: 'Question vide' });
        }

        // 🎯 Prompt système pour Curiosity
        const systemPrompt = `Tu es Curiosity, un assistant culturel français érudit et bienveillant.

RÈGLES STRICTES :
- Réponds en MAXIMUM ${max_sentences} phrases courtes et claires
- Spécialités : histoire, philosophie, arts, culture française
- Ton : bienveillant, précis, cultivé
- TOUJOURS citer tes sources entre parenthèses : (Source: Wikipédia) ou (Selon Voltaire)
- Si demande de soutien psychologique : redirige vers professionnels de santé
- Fact-checking systématique : ne donne que des infos vérifiées

Réponds maintenant à cette question :`;

        // 🌐 Appel à l'API Mistral
        const mistralResponse = await fetch(MISTRAL_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${MISTRAL_API_KEY}`
            },
            body: JSON.stringify({
                model: 'mistral-small-latest', // Version gratuite compatible
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: question }
                ],
                temperature: 0.7,
                max_tokens: 200, // Limite pour rester concis
                top_p: 1
            })
        });

        if (!mistralResponse.ok) {
            const errorData = await mistralResponse.json();
            console.error('Erreur Mistral API:', errorData);
            throw new Error('Erreur API Mistral');
        }

        const data = await mistralResponse.json();
        const answer = data.choices[0].message.content;

        // 📚 Extraction des sources (simplifiée)
        const sources = extractSources(answer);

        // 📝 Log pour monitoring
        console.log(`[${new Date().toISOString()}] Question: "${question}" | Réponse: ${answer.substring(0, 50)}...`);

        res.json({
            answer: answer,
            sources: sources,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Erreur serveur:', error);
        res.status(500).json({ 
            error: 'Erreur interne du serveur',
            message: error.message 
        });
    }
});

// 🔍 Fonction d'extraction des sources
function extractSources(text) {
    const sourcePatterns = [
        /\(Source:\s*([^)]+)\)/gi,
        /\(Selon\s*([^)]+)\)/gi,
        /\(D'après\s*([^)]+)\)/gi
    ];

    const sources = [];
    sourcePatterns.forEach(pattern => {
        const matches = text.matchAll(pattern);
        for (const match of matches) {
            sources.push(match[1].trim());
        }
    });

    return sources.length > 0 ? sources : ['Connaissances générales'];
}

// 🚀 Démarrage du serveur
app.listen(PORT, () => {
    console.log(`🧠 Curiosity Backend démarré sur le port ${PORT}`);
    console.log(`📡 API disponible sur http://localhost:${PORT}/api/chat`);
});

// Export pour Vercel (serverless)
module.exports = app;