# 🧠 Curiosity - Assistant Conversationnel Français

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Mistral AI](https://img.shields.io/badge/Powered%20by-Mistral%20AI-orange)](https://mistral.ai/)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/DEV-Xprmnts/curiosity)

**Curiosity** est un agent conversationnel français gratuit et open source, spécialisé en histoire, philosophie et culture artistique. Il fournit des réponses ultra-concises (2 phrases maximum) avec sources vérifiées.

🌐 **Démo live** : [presentcomposedesign.fr/curiosity](https://presentcomposedesign.fr/curiosity)

---

## ✨ Caractéristiques

- 🇫🇷 **100% français** : Propulsé par Mistral AI, modèle français souverain
- ⚡ **Ultra-concis** : Réponses limitées à 2 phrases pour aller à l'essentiel
- 📚 **Sources vérifiées** : Chaque réponse cite ses sources (fact-checking systématique)
- 🎤 **Interface vocale** : Reconnaissance et synthèse vocale intégrées
- 🔒 **Vie privée** : Aucune connexion compte requise, aucune donnée collectée
- 🆓 **Gratuit** : Open source (MIT License) et hébergement gratuit possible
- 🎨 **Personnalisable** : Interface, voix, modes (enfant/ado/adulte) - *en développement*

---

## 🎯 Cas d'usage

### 📖 Vérification rapide d'informations
Remplacez Google par une réponse claire et sourcée en 2 phrases.

**Exemple** :  
*"Qui était Voltaire ?"*  
→ *"Voltaire (1694-1778) était un écrivain et philosophe français des Lumières, célèbre pour ses combats contre l'intolérance religieuse et ses œuvres comme Candide. Il incarne l'esprit critique et la défense de la liberté d'expression. (Source: Encyclopédie Universalis)"*

### 💬 Compagnon de discussion culturelle
Discutez d'histoire, philosophie, littérature avec un assistant érudit et bienveillant.

**Exemple** :  
*"Explique-moi la différence entre Eros et Thanatos selon Freud"*

### 🎓 Aide pédagogique
Pour étudiants, enseignants, ou simples curieux cherchant des réponses claires.

---

## 🏗️ Architecture

```
┌─────────────────┐
│  WordPress      │  ← Interface utilisateur (vocal + texte)
│  + Widget HTML  │
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────┐
│  Backend API    │  ← Node.js + Express (Vercel)
│  server.js      │     • Rate limiting
└────────┬────────┘     • Protection clé API
         │              • Logs
         ▼
┌─────────────────┐
│  Mistral AI     │  ← Modèle de langage français
│  API            │
└─────────────────┘
```

---

## 🚀 Installation

### Prérequis
- Node.js 18+
- Compte [Mistral AI](https://console.mistral.ai/) (gratuit)
- Compte [Vercel](https://vercel.com) (gratuit) pour le déploiement

### Étape 1 : Cloner le repo
```bash
git clone https://github.com/DEV-Xprmnts/curiosity.git
cd curiosity
```

### Étape 2 : Installer les dépendances
```bash
npm install
```

### Étape 3 : Configurer les variables d'environnement
```bash
cp .env.example .env
```

Éditez `.env` et ajoutez votre clé API Mistral :
```
MISTRAL_API_KEY=votre_clé_api_mistral
PORT=3000
```

### Étape 4 : Lancer en local
```bash
npm start
```

Le serveur démarre sur `http://localhost:3000`

**Testez l'API** :
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "Qui était Victor Hugo?"}'
```

---

## ☁️ Déploiement sur Vercel (gratuit)

### Option 1 : Déploiement en 1 clic
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/DEV-Xprmnts/curiosity)

1. Cliquez sur le bouton ci-dessus
2. Connectez votre compte GitHub
3. Ajoutez la variable d'environnement `MISTRAL_API_KEY`
4. Déployez !

### Option 2 : Via CLI Vercel
```bash
npm install -g vercel
vercel login
vercel
```

Lors du déploiement, ajoutez :
```bash
vercel env add MISTRAL_API_KEY
```

**URL de production** : `https://votre-projet.vercel.app`

---

## 🌐 Intégration WordPress

### Méthode 1 : Bloc HTML personnalisé

1. Téléchargez le fichier `curiosity-widget.html` (disponible dans `/frontend`)
2. Modifiez la ligne 142 avec votre URL Vercel :
   ```javascript
   const API_URL = 'https://votre-backend.vercel.app/api/chat';
   ```
3. Dans WordPress, créez une page et ajoutez un bloc **HTML personnalisé**
4. Collez le code du widget
5. Publiez !

### Méthode 2 : Shortcode (avancé)

Ajoutez dans `functions.php` de votre thème :
```php
function curiosity_widget_shortcode() {
    ob_start();
    include(get_template_directory() . '/curiosity-widget.html');
    return ob_get_clean();
}
add_shortcode('curiosity', 'curiosity_widget_shortcode');
```

Utilisez `[curiosity]` n'importe où dans WordPress.

---

## 📊 Limites et quotas

### Mistral AI (gratuit)
- ✅ 500 000 tokens/mois (~10 000 questions)
- ✅ 5 requêtes/seconde
- 💰 Au-delà : ~2€/million de tokens

### Rate limiting (backend)
- 20 requêtes par minute par IP (modifiable dans `server.js`)
- Protection anti-abus intégrée

### Navigateurs supportés
- ✅ **Chrome/Edge** : vocal + texte
- ⚠️ **Firefox** : texte uniquement (vocal limité)
- ⚠️ **Safari** : vocal partiel

---

## 🛠️ Configuration avancée

### Modifier le nombre de phrases max
Dans `server.js`, ligne 51 :
```javascript
const systemPrompt = `Tu es Curiosity...
- Réponds en MAXIMUM 2 phrases courtes et claires  // ← Changez ici
...`;
```

### Personnaliser l'apparence du widget
Dans `curiosity-widget.html`, modifiez les couleurs (lignes 19-20) :
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

Générateur de dégradés : [cssgradient.io](https://cssgradient.io/)

### Désactiver la synthèse vocale
Dans `curiosity-widget.html`, ligne 305, commentez :
```javascript
// speakResponse(data.answer);
```

---

## 🔐 Sécurité

- ✅ **Clé API cachée** : Jamais exposée côté client
- ✅ **Rate limiting** : Protection contre les abus
- ✅ **CORS configuré** : Requêtes autorisées uniquement depuis votre domaine
- ✅ **HTTPS obligatoire** : Pour le micro et la sécurité
- ✅ **Pas de stockage** : Aucune donnée utilisateur conservée

---

## 🗺️ Roadmap

### ✅ Version 1.0 (Actuelle)
- [x] Interface texte + vocale
- [x] Réponses concises avec sources
- [x] Backend sécurisé
- [x] Déploiement Vercel
- [x] Intégration WordPress

### 🔜 Version 2.0 (Q2 2025)
- [ ] Modes : Enfant / Adolescent / Adulte
- [ ] Mode Personnel / Professionnel
- [ ] Personnalités multiples (Freud, Voltaire, etc.)
- [ ] Menu Settings complet
- [ ] Contrôle parental avancé
- [ ] Historique des conversations
- [ ] Export PDF des réponses

### 🚀 Version 3.0 (Q3 2025)
- [ ] Base de connaissances enrichie (Gallica, Europeana)
- [ ] Fact-checking automatique multi-sources
- [ ] API publique documentée
- [ ] Application mobile (React Native)
- [ ] Mode hors-ligne

---

## 🤝 Contribuer

Les contributions sont les bienvenues ! 🎉

### Comment contribuer ?

1. **Fork** le projet
2. Créez une branche : `git checkout -b feature/ma-fonctionnalite`
3. Commitez : `git commit -m 'Ajout de ma fonctionnalité'`
4. Pushez : `git push origin feature/ma-fonctionnalite`
5. Ouvrez une **Pull Request**

### Zones d'amélioration prioritaires
- 🎨 Design UI/UX du widget
- 🧪 Tests unitaires et d'intégration
- 📚 Enrichissement des sources de données
- 🌍 Support multilingue (espagnol, anglais)
- ♿ Accessibilité (WCAG 2.1)

---

## 📝 Licence

Ce projet est sous licence **MIT** - voir le fichier [LICENSE](LICENSE) pour plus de détails.

Vous êtes libre de :
- ✅ Utiliser commercialement
- ✅ Modifier
- ✅ Distribuer
- ✅ Utiliser en privé

---

## 👨‍💻 Auteur

**DEV-Xprmnts**  
🌐 [presentcomposedesign.fr](https://presentcomposedesign.fr)  
📧 Contact : [via le site web](https://presentcomposedesign.fr/contact)

---

## 🙏 Remerciements

- [Mistral AI](https://mistral.ai/) - Modèle de langage français
- [Vercel](https://vercel.com) - Hébergement gratuit
- [Mozilla](https://developer.mozilla.org/) - Web Speech API
- Tous les contributeurs futurs ! ❤️

---

## 📖 Documentation

- [Guide d'installation détaillé](docs/INSTALLATION.md) *(à venir)*
- [API Reference](docs/API.md) *(à venir)*
- [FAQ](docs/FAQ.md) *(à venir)*

---

## ⭐ Star ce projet !

Si Curiosity vous est utile, n'oubliez pas de mettre une ⭐ sur GitHub et de visiter mon site internet. 

---

Curiosity - 2025 - https://presentcomposedesign.fr/curiosity 
