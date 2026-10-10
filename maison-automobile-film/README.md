# Maison Automobile — Launch Film v1

Film de lancement vertical (Reels / TikTok / Meta Ads), construit dans Remotion.

- **Fichier :** `out/maison-automobile-launch-film-v1.mp4`
- **Format :** 1080 × 1920 (9:16), 30 fps, durée 27,0 s (810 frames)
- **Vidéo :** H.264 CRF 16
- **Audio :** AAC 256 kb/s, masterisé à −14 LUFS / −1 dBTP

```bash
npm install
npm run audio    # régénère musique + sound design (python3 + numpy)
npm run studio   # Remotion Studio
npm run render   # rendu + mastering loudness → out/maison-automobile-launch-film-v1.mp4
```

Le rendu utilise le Chromium local (`/opt/pw-browsers/...`). Pour en utiliser un autre, définir `REMOTION_BROWSER=/chemin/vers/chrome`.

---

## ⚠️ Sources de vérité — important

Le repository hôte (`wingia-tracker`) est un projet e-commerce sans aucun asset Maison Automobile. De plus, **maisonautomobile.ca n'était pas joignable** pendant la production : le proxy de l'environnement refusait l'hôte et le DNS public répondait `ENOTFOUND`.

Conséquences :

- **Aucune information factuelle n'a été inventée.** Le film n'affiche que des faits présents dans le brief :
  - flotte sélectionnée, de l'accessible au premium ;
  - préparation du véhicule ;
  - remise coordonnée selon le lieu et l'horaire ;
  - Montréal / Laval ;
  - pas de comptoir, pas de file ;
  - la signature « Votre voiture. Là où vous en avez besoin. » ;
  - l'adresse maisonautomobile.ca.
- **Aucun modèle, prix, condition ou promotion** n'apparaît.
- Les véhicules sont des **silhouettes vectorielles génériques**, éclairées comme en studio (compacte, berline, VUS). Elles n'évoquent aucune marque. C'est un choix délibéré, conforme au brief : *« si un asset manque, crée une solution graphique plutôt qu'une photo médiocre »*.
- Le **logo est une reconstruction typographique** (Archivo Expanded), et la palette encre / os / cuivre est un choix de direction artistique. Les deux se remplacent à un seul endroit : `src/lib/theme.ts` pour la palette, `src/components/BrandLockup.tsx` pour le logo.
- Les seules données ajoutées sont des **faits publics** : les coordonnées GPS de Montréal (45.5019° N, 73.5674° O) et de Laval (45.6066° N, 73.7124° O), et la rivière des Prairies qui les sépare. La disposition est géographiquement juste : Laval au nord, en haut ; Montréal au sud, en bas.

---

## Concept : « Sans le comptoir »

Le film oppose deux mondes. Il ouvre dans l'univers froid du comptoir de location : numéro de ticket 047, afficheur « EN SERVICE 012 → 013 », file de tickets qui n'avance pas.

Puis une carrosserie traverse le cadre à pleine vitesse et **entraîne derrière elle le monde Maison Automobile** : studio noir, lumière, typographie éditoriale.

Le phare laisse une **ligne de lumière**. Cette ligne devient le fil conducteur du film :

- elle dessine la berline ;
- la roue devient un cadran ;
- le cadran devient le sélecteur ;
- le sélecteur s'aplatit en ligne de temps ;
- la rivière des Prairies se redresse en ligne ;
- cette ligne ouvre enfin le logo.

### Séquences et durées

| # | Séquence | Frames | Temps | Durée |
|---|---|---|---|---|
| 01 | **Hook** — comptoir, file, passage de la carrosserie | 0–90 | 0,0–3,0 s | 3,0 s |
| 02 | **Désir** — tracé lumière « VOITURE », flotte en 3 bandes, zoom optique dans la roue → cadran | 90–330 | 3,0–11,0 s | 8,0 s |
| 03 | **Simplicité** — sélecteur → ligne de temps lieu/horaire → clés en pendule | 330–480 | 11,0–16,0 s | 5,0 s |
| 04 | **Territoire** — LAVAL / rivière / MONTRÉAL, pliage en LAV / MTL, route cuivre | 480–615 | 16,0–20,5 s | 4,5 s |
| 05 | **Marque** — silence, ligne, MAISON / AUTOMOBILE, signature, URL, tenue | 615–810 | 20,5–27,0 s | 6,5 s |

Chaque changement de scène tombe sur la grille du tempo : 120 BPM, 1 temps = 15 frames.

### Moments clés

1. **La carrosserie qui efface le comptoir.** Le monde sombre est révélé derrière le coffre du véhicule. Le flou de mouvement est proportionnel à la vitesse instantanée.
2. **« VOITURE » derrière la berline.** Le texte passe sous la carrosserie, avec une parallaxe en sens opposé.
3. **Zoom optique dans la roue.** La roue devient un cadran (120 graduations, texte circulaire). Un reflet balaie la jante, et cette même lumière révèle « préparée. ».
4. **MONTRÉAL → MTL, LAVAL → LAV.** Les lettres se replient sur elles-mêmes.
5. **La rivière qui devient la ligne du logo.** MAISON sort par-dessus la ligne, AUTOMOBILE par-dessous, puis un reflet spéculaire traverse les lettres.

---

## Texte exact affiché à l'écran

| Temps | Texte |
|---|---|
| 0,0 s | `047` · `VOTRE NUMÉRO` · `EN SERVICE` `012` → `013` · tickets `048 049 050…` |
| 0,1 s | **PAS DE / COMPTOIR.** |
| 1,1 s | **PAS DE / FILE.** |
| 3,6 s | *la bonne* · **VOITURE** |
| 5,9 s | **DE L'ACCESSIBLE** |
| 6,5 s | **AU PREMIUM.** |
| 9,0 s | **SÉLECTIONNÉE.** · anneau : `SÉLECTIONNÉE — PRÉPARÉE —` |
| 9,8 s | *préparée.* |
| 11,1 s | **CHOISISSEZ.** |
| 12,8 s | **ON COORDONNE.** · `VOTRE LIEU` · `VOTRE HORAIRE` |
| 14,6 s | *prenez* · **LES CLÉS.** |
| 16,0 s | **LAVAL** `45.6066° N 73.7124° O` · `RIVIÈRE DES PRAIRIES` · **MONTRÉAL** `45.5019° N 73.5674° O` |
| 17,9 s | **LAV** / **MTL** |
| 18,3 s | `REMISE COORDONNÉE` · *selon votre lieu et votre horaire.* |
| 21,5 s | **MAISON / AUTOMOBILE** |
| 23,1 s | Votre voiture. · *Là où vous en avez besoin.* |
| 23,7 s | `MONTRÉAL — LAVAL` |
| 24,6 s | `maisonautomobile.ca` |

Mobilier éditorial discret en haut de cadre : `MAISON AUTOMOBILE` et un index (`N° 01 — LA FLOTTE`, `N° 02 — LA PRÉPARATION`, `N° 03 — LA REMISE`, `N° 04 — LE TERRITOIRE`).

Le texte essentiel reste au-dessus de y ≈ 1500 px, hors des zones couvertes par l'interface Reels / TikTok.

---

## Script voix off final

Le script tient en peu de mots, avec des phrases nominales. Il est calé sur l'image.

| Début | Réplique | Calé sur |
|---|---|---|
| 0,1 s | Pas de comptoir. | « COMPTOIR. » (f8) |
| 1,1 s | Pas de file. | « FILE. » (f39) |
| 3,5 s | Juste la bonne voiture. | tracé lumière de la berline |
| 8,8 s | Sélectionnée. | « SÉLECTIONNÉE. » (f272) |
| 9,8 s | Préparée. | reflet sur la jante (f294) |
| 11,1 s | Vous choisissez. | verrouillage du sélecteur (f362) |
| 12,7 s | On coordonne. | « ON COORDONNE. » (f386) |
| 14,5 s | Vous prenez les clés. | chute de la clé (f436) |
| 16,0 s | Montréal. Laval. | coup sur MONTRÉAL (f480) |
| 18,5 s | Selon votre lieu et votre horaire. | texte en italique (f560) |
| 21,5 s | Maison Automobile. | coup de marque (f645) |
| 23,1 s | Votre voiture. Là où vous en avez besoin. | signature (f693) |

Le silence de 20,5 s à 21,5 s est volontaire. **Ne rien dire avant « Maison Automobile ».**

### Indications ElevenLabs

- **Voix :** français québécois neutre (pas d'accent parisien), timbre grave et chaud, proximité micro, ton confiant, presque confidentiel. Pas une voix « pub radio ».
- **Réglages de départ :** Stability 0,50–0,60 · Similarity 0,80 · Style 0,15–0,25 · Speaker boost activé · vitesse ≈ 0,95.
- **Méthode recommandée :** générer **chaque ligne séparément** (meilleur contrôle), puis les placer aux temps ci-dessus. Pour une prise unique, utiliser des pauses : `<break time="0.6s" />` entre les phrases, `<break time="1.2s" />` avant « Maison Automobile ».
- **Prononciation :** « Maison Automobile » se dit lentement, avec un léger appui sur *Mai-* et *-mo-*. « Montréal. Laval. » se dit en deux impacts secs.
- **Intégration :** déposer le fichier dans `public/` puis le passer en prop `voiceover="vo.wav"`, ou l'ajouter dans `defaultProps` (`src/Root.tsx`). La musique laisse de la place : son pad reste sous 2 kHz et les médiums sont dégagés. Si la voix manque de présence, baisser la musique à environ 0,6 dans `LaunchFilm.tsx`.

---

## Musique et sound design

> **PISTE TEMPORAIRE.** La musique est une composition originale, synthétisée de zéro par `scripts/generate_audio.py` (numpy). Elle est donc libre de droits. Elle sert de piste de travail sur la grille définitive : la remplacer par une piste sous licence ou une composition au même tempo (120 BPM) préserve tous les cuts.

Structure : électro minimale sombre, en ré mineur, accords Dm–B♭–F–C.

- **0–3 s :** bourdonnement néon froid et tic-tac du compteur.
- **3 s :** drop (impact) — kick, basse pulsée en croches, pad.
- **11 s :** arpège avec écho en croche pointée.
- **16 s :** montée en énergie.
- **19,5 s :** riser.
- **20,5 s :** coupure, silence.
- **21,5 s :** coup de marque et accord tenu, avec des pulsations lentes sous l'end card.

Les effets sonores sont des one-shots placés à la frame (`src/lib/cues.ts`) :

- tic-tac, carillon froid du comptoir ;
- passage de voiture (effet Doppler) ;
- impacts graves ;
- whooshes ;
- clics d'interface ;
- roulement du sélecteur ;
- allumage des phares ;
- tintement de clés ;
- frappes de coordonnées ;
- souffle avant la marque.

---

## Assets utilisés

| Asset | Source |
|---|---|
| Archivo (variable, wdth 62–125) | Google Fonts, OFL — `public/fonts/` |
| Instrument Serif (roman + italique) | Google Fonts, OFL |
| IBM Plex Mono 400/500 | Google Fonts, OFL |
| Véhicules (compacte, berline, VUS), roues, clé | Vectoriels dessinés pour le film — `src/components/Vehicle.tsx`, `S3Process.tsx` |
| Musique + 15 SFX | Générés — `scripts/generate_audio.py` → `public/audio/` |
| Logo | Reconstruction typographique — `src/components/BrandLockup.tsx` |

Aucune image stock et aucun asset tiers sous licence.

## Architecture

```
src/
  Root.tsx              composition LaunchFilm (1080×1920, 810 f)
  LaunchFilm.tsx        montage des 5 scènes + grain + audio + VO optionnelle
  lib/theme.ts          palette, typo, easings, grille tempo, timeline maître
  lib/cues.ts           feuille de sound design (frames)
  lib/anim.ts           ramp/keys (interpolate clampé), rand déterministe
  components/           Vehicle, KineticText (MaskRise, SlotRoll, TypeOn,
                        FocusWords, Squeeze), BrandLockup, BeatImpact, Grain, Hud
  scenes/               S1Hook … S5Brand
```

- **Déterminisme :** l'animation dépend uniquement de `useCurrentFrame()`, sans CSS animation ni horloge réelle. Le grain utilise `feTurbulence`, avec une graine dérivée de la frame.
- **Autres formats :** toute la timeline est dans `T` (`theme.ts`) et chaque scène est autonome. Pour un 1:1 ou un 16:9, enregistrer une nouvelle `<Composition>` et ajuster les positions verticales des scènes. Les véhicules vectoriels se recadrent sans perte.

---

## Améliorations qui feraient une vraie différence

1. **Vraies photos de la flotte et vrai logo.** C'est le gain n°1. `Vehicle` peut céder la place à des photos détourées (PNG transparents, vue de profil) dans les bandes de la scène 2 et le sélecteur de la scène 3, sans toucher aux animations.
2. **Musique finale** composée ou sous licence, à 120 BPM, avec la même structure : drop à 3 s, coupure à 20,5 s, coup à 21,5 s.
3. **Voix off ElevenLabs** posée sur la grille ci-dessus, puis un mix de l'ensemble.
4. **Déclinaisons 1:1 et 16:9** pour Meta Feed et YouTube, et une version courte de 15 s (scènes 1, 2a, 4 et 5).
