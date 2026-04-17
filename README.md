# WINGIA — Guide de déploiement

Salut Nabil 👋 Voici ton site **WINGIA** complet, prêt à être mis en ligne sur Vercel avec paiements Stripe.

---

## 📦 Ce que tu as dans ce projet

```
wingia-next/
├── app/
│   ├── page.js              ← Page d'accueil
│   ├── shop/page.js         ← Page boutique
│   ├── product/[id]/page.js ← Page produit individuelle
│   ├── success/page.js      ← Page après paiement réussi
│   ├── cancel/page.js       ← Page si paiement annulé
│   ├── api/checkout/        ← Endpoint Stripe
│   ├── globals.css          ← Styles
│   └── layout.js            ← Layout global + fonts
├── components/
│   └── Storefront.jsx       ← Tout le UI (header, hero, cart, etc.)
├── lib/
│   ├── products.js          ← 🔴 ICI tu ajoutes tes produits
│   └── stripe.js            ← Client Stripe
├── public/
│   └── products/            ← 🔴 ICI tu mets tes photos de produits
├── package.json
├── .env.example             ← Copie vers .env.local et remplis
└── .gitignore
```

---

## 🚀 Déploiement — Étape par étape

### Étape 1 — Crée tes comptes (15 min)

1. **GitHub** → https://github.com (gratuit)
2. **Vercel** → https://vercel.com (gratuit, connecte avec ton GitHub)
3. **Stripe** → https://stripe.com (gratuit, il te faudra ton numéro d'entreprise)

### Étape 2 — Install et test local (10 min)

Ouvre ton terminal, va dans le dossier `wingia-next` et fais:

```bash
npm install
cp .env.example .env.local
npm run dev
```

Ouvre http://localhost:3000 — ton site devrait tourner 🔥

### Étape 3 — Push sur GitHub (5 min)

```bash
git init
git add .
git commit -m "Initial WINGIA"
```

Ensuite, crée un nouveau repo sur GitHub (appelle-le `wingia`), puis:

```bash
git remote add origin https://github.com/TON_USERNAME/wingia.git
git branch -M main
git push -u origin main
```

### Étape 4 — Déploie sur Vercel (3 min)

1. Va sur https://vercel.com/new
2. Clique "Import" sur ton repo `wingia`
3. **Avant de cliquer "Deploy"**, ajoute les variables d'environnement:
   - `STRIPE_SECRET_KEY` = ta clé secrète Stripe (commence par `sk_test_` ou `sk_live_`)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = ta clé publishable Stripe
4. Clique **Deploy** ✅

Dans 2 minutes, tu as ton site live sur `wingia.vercel.app`.

### Étape 5 — Branche ton domaine (10 min) — OPTIONNEL

1. Achète `wingia.ca` (ou `.com`) sur Namecheap / OVH / Google Domains (~15$/an)
2. Dans Vercel: Settings → Domains → Add → entre `wingia.ca`
3. Copie les records DNS que Vercel te donne et colle-les dans ton registrar
4. Attends 5-30 min → ton site est sur `wingia.ca` 🎉

---

## 💳 Configuration Stripe

### A. Récupère tes clés API

1. Va sur https://dashboard.stripe.com/apikeys
2. Copie la **Publishable key** (`pk_test_...`) et la **Secret key** (`sk_test_...`)
3. Mets-les dans Vercel (Settings → Environment Variables)

**⚠️ Utilise les clés TEST au début**, passe en LIVE seulement quand tu es prêt à accepter des vrais paiements.

### B. Crée tes produits dans Stripe (méthode recommandée)

Pour chaque produit réel que tu veux vendre:

1. Stripe Dashboard → **Products** → **Add product**
2. Remplis: Nom, Description, Image, Prix (en CAD)
3. Copie le **Price ID** (format `price_xxxxxxxxxxxxx`)
4. Ouvre `lib/products.js` dans ton code et remplace `price_REPLACE_ME_X` par le vrai Price ID

**Alternative rapide:** si tu ne veux pas configurer dans Stripe, le code fonctionne quand même — il crée le produit "à la volée" au checkout avec le prix défini dans `lib/products.js`. C'est plus lent à scale mais parfait pour démarrer.

### C. Test de paiement

Stripe fournit une carte de test:
- Numéro: `4242 4242 4242 4242`
- Date: n'importe quelle date future
- CVC: n'importe quels 3 chiffres
- Nom: n'importe quoi

Teste une commande complète avec cette carte pour valider que tout fonctionne.

---

## 📸 Ajouter tes produits et tes photos

### 1. Upload tes photos

Mets tes photos de produits dans le dossier `public/products/`:
```
public/products/
├── stussy-hoodie-1.jpg
├── moncler-maya.jpg
└── ...
```

### 2. Édite `lib/products.js`

Pour chaque produit, modifie:

```javascript
{
  id: "stussy-8ball-hoodie",        // ← identifiant unique
  stripePriceId: "price_1ABC...",    // ← Price ID de Stripe
  brand: "Stüssy",
  name: "8 Ball Heavyweight Hoodie",
  price: 185,                         // ← prix en CAD
  category: "Hoodies",                // ← Outerwear, Hoodies, Knitwear, Bags, Accessories
  badge: "NEW",                       // ← "NEW", "ICON", "HEAT", "VINTAGE" ou null
  colors: ["#0a0a0a", "#5a4a3a"],    // ← codes couleur hex
  colorNames: ["Black", "Olive"],     // ← noms des couleurs
  sizes: ["S", "M", "L", "XL"],
  images: ["/products/stussy-hoodie-1.jpg"],  // ← chemin vers ta photo
  gradient: "linear-gradient(...)",   // ← fallback si pas de photo
  accent: "#c9a86a",
  description: "Description courte du produit.",
  details: [
    "400 GSM brushed fleece",
    "100% organic cotton",
    "Made in Portugal",
  ],
  inStock: true,
}
```

Après chaque modification, `git add . && git commit -m "add products" && git push` — Vercel redéploie automatiquement 🚀

---

## 🎯 Avant de vendre pour vrai — Checklist légale (Québec)

- [ ] **Politique de confidentialité** (obligatoire — Loi 25 au QC)
- [ ] **Politique de retour** (tu en parles déjà sur le site — formalise-la)
- [ ] **Conditions d'utilisation**
- [ ] **Immatriculation entreprise** (Registraire des entreprises du Québec — si tu veux vendre officiellement)
- [ ] **Comptes TPS/TVQ** (obligatoire si > 30 000$/an de ventes)
- [ ] **Passer de Stripe TEST à LIVE** (vérification KYC de Stripe)

---

## 🔧 Tu veux modifier quelque chose?

- **Changer le texte du hero** → `components/Storefront.jsx`, cherche `CRAFTED` et `IN SHADOW`
- **Changer les couleurs** → `app/globals.css`, modifie les variables `--bg`, `--gold`, etc.
- **Changer le ticker** → `components/Storefront.jsx`, cherche `function Ticker`
- **Ajouter une page (ex: /about)** → crée `app/about/page.js`

---

## 🆘 Si ça marche pas

1. `npm run dev` fonctionne en local? → vérifie que `.env.local` contient les 2 clés Stripe
2. Build Vercel échoue? → vérifie que les env vars sont configurées dans Vercel
3. Checkout redirige pas? → ouvre la console du navigateur (F12) et check les erreurs
4. Stripe donne une erreur? → vérifie que la clé est bien `sk_test_` au début, pas `sk_live_`

---

## 📈 Prochaines étapes (après mise en ligne)

1. **SEO organique** (ton domaine chez Aurolys):
   - Google Search Console + Bing Webmaster
   - Schema.org Product markup (à ajouter dans les pages produit)
   - Sitemap.xml auto-généré
   - Pages `/about`, `/shipping`, `/returns` pour l'autorité

2. **Marketing organique streetwear**:
   - TikTok dark mode aesthetic (tu as déjà l'œil)
   - Instagram feed cohérent (grille éditoriale)
   - Collab avec micro-influenceurs MTL
   - Newsletter drops (tu peux connecter Klaviyo au formulaire du footer)

3. **Upgrades possibles**:
   - Analytics (Vercel Analytics gratuit ou Plausible)
   - Chat support (Tawk.to, Crisp)
   - Email transactionnel (Resend, Postmark)
   - Gestion d'inventaire (Airtable comme backend simple)

---

Bonne chance avec WINGIA 🔥
