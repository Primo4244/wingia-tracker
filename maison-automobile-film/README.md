# Maison Automobile — Film de lancement v10

Film de lancement vertical (Reels / TikTok / Meta Ads), construit dans Remotion.

- **Fichier :** `out/maison-automobile-launch-film-v10.mp4` (les rendus ne sont pas versionnés, `.mp4` est ignoré par git)
- **Format :** 1080 × 1920 (9:16), 30 fps, durée 27,0 s (810 frames)
- **Vidéo :** H.264 CRF 16
- **Audio :** AAC 256 kb/s, masterisé à −14 LUFS, crête vraie ≤ −1,5 dBTP, voix off Maggie (ElevenLabs) + musique temporaire

```bash
npm install
npm run audio    # régénère musique + sound design (python3 + numpy)
npm run studio   # Remotion Studio
npm run render   # rendu + mastering loudness → out/maison-automobile-launch-film.mp4
python scripts/prepare_cars.py <dossier des photos du site> public/cars   # photos de la flotte (voir plus bas)
node scripts/prepare_clips.mjs   # convertit les vidéos de incoming/ en clips (voir « Clips vidéo »)
```

- Le mastering (`scripts/master.mjs`) est un script Node, sans bash. Il appelle `ffmpeg` : s'il n'est pas dans le PATH, définir `FFMPEG=/chemin/vers/ffmpeg`.
- Dans le conteneur cloud, le rendu utilise le Chromium installé (`/opt/pw-browsers/...`). Ailleurs, Remotion télécharge son propre navigateur au premier rendu ; `REMOTION_BROWSER=/chemin/vers/chrome` force un navigateur précis.
- `scripts/prepare_cars.py` demande Python 3 et Pillow (`pip install pillow`).

---

## Sources de vérité

- **Site :** maisonautomobile.ca (flotte, textes, polices, couleurs).
- **Flotte :** le site fait foi. Le film montre cinq véhicules, **du plus accessible au plus premium** : Kia K4, Audi A3, Toyota RAV4, Mercedes-Benz GLE, Porsche Cayenne.
- **Aucun prix, aucune condition, aucune promotion** n'apparaît. Les plans de voitures portent la mention **« selon disponibilité »** (le site précise que le modèle, l'année et la couleur peuvent varier).
- **Zone :** le film dit **« Partout au Québec »**, à l'écran et dans la voix off, à la demande du client. Le site indique pour l'instant « remise à Montréal ou Laval » ; **le client met le site à jour**. À revérifier avant diffusion.
- **Logo :** SVG fourni par le client (`public/brand/maison-automobile-logo.svg`, vectorisation automatique). Tracés dans `src/lib/logo-paths.ts`, animation dans `src/components/Logo.tsx`.
- Les seules données ajoutées sont des **faits publics** : le contour de la province de Québec (`click_that_hood/canada.geojson`, simplifié dans `src/lib/quebec.ts`) et la position de Montréal, point de départ de l'onde lumineuse.

## Marque (reprise du site)

- **Police :** Archivo (variable, wdth 62–125, wght 100–900) pour tout le film. Pas d'italique : la hiérarchie vient des graisses, des largeurs et des tailles.
- **Couleurs :** noir `#000000`, blanc cassé `#F5F0E6`, **carmin** `#C4403B` / `#E15249` comme seul accent (« FILE. », progression, sous-lignes). Définies dans `src/lib/theme.ts`.
- **Interface en verre :** panneaux semi-transparents, flou d'arrière-plan, bordure fine, reflet qui glisse. `GlassLabel` enveloppe le texte et se centre dessus ; `Glass` sert aux formes fixes.

## Photos de la flotte

Photos de `maisonautomobile.ca` (pages `/vehicules/<modèle>`), fournies par le client. `scripts/prepare_cars.py` :

1. **floute** les logos de marque, badges, centres de roue, inscriptions sur les pneus et toute plaque d'immatriculation (les placards « MAISON AUTOMOBILE » sont la marque du client et restent) ;
2. recadre / redimensionne ;
3. écrit `public/cars/*.jpg`.

| Fichier | Source | Utilisation |
|---|---|---|
| `pass` | `mercedes-gle-1` | scène 1 : la voiture traverse l'écran |
| `night` | `audi-a3-1` | scène 2 : « la bonne voiture » |
| `k4`, `a3`, `rav4`, `gle`, `cayenne` | `kia-k4-3`, `audi-a3-2`, `toyota-rav4-1`, `mercedes-gle-1`, `porsche-cayenne-2` | scène 2 : la flotte, scène 3 : le carrousel |
| `macro` | `kia-k4-4` (3213×5712) | scène 2 : gros plan « Sélectionnée / préparée » |

Les zones à flouter sont en coordonnées de la photo d'origine : **les revérifier à l'œil dès qu'une photo est remplacée.**

## Clips vidéo (plans filmés)

Chaque plan est un **emplacement** : `k4`, `a3`, `rav4`, `gle`, `cayenne` (cartes de la flotte), `night` (« la bonne voiture »), `macro` (gros plan), `pass` (passage d'ouverture). Un emplacement utilise son **clip** s'il existe, sinon sa **photo** : on peut donc remplacer les photos une par une.

1. Déposer les fichiers bruts dans `incoming/` (ignoré par git), nommés d'après l'emplacement : `rav4.mov`, `macro.mp4`…
2. `node scripts/prepare_clips.mjs` : conversion en H.264 30 i/s (1920 de large pour l'horizontal, 2160 pour `macro`, 1080 pour `pass`), HDR ramené en SDR, puis réécriture de `src/lib/clips.generated.ts`.
3. Régler le moment utile et la vitesse de chaque clip dans `src/lib/fleet.ts` (`CLIP_IN`, `CLIP_RATE`).
4. Pour revenir à la photo d'un emplacement : supprimer `public/cars/clips/<emplacement>.mp4` et relancer le script.

Les logos se masquent **sur la voiture** (ruban noir mat), pas à l'image. `CLIP_SPOTS` (`fleet.ts`) permet de flouter des zones, mais seulement sur un plan à caméra fixe. Consignes complètes : `PLAN-DE-TOURNAGE.md`.

---

## Concept : « Sans le comptoir »

Le film oppose deux mondes. Il ouvre dans l'univers froid du comptoir de location : des poteaux à sangles de file d'attente qui s'enfoncent en perspective, une file qui n'avance pas.

Puis une vraie voiture de la flotte traverse le cadre à pleine vitesse et **entraîne derrière elle le monde Maison Automobile** : fond noir, lumière, verre.

Une **ligne de lumière** devient le fil conducteur : elle s'ouvre sur la voiture, le carrousel de sélection s'aplatit en ligne de temps, la province s'aplatit en ligne, et cette ligne ouvre enfin le logo.

### Séquences et durées

| # | Séquence | Frames | Temps | Durée |
|---|---|---|---|---|
| 01 | **Hook** — file d'attente, passage de la voiture | 0–90 | 0,0–3,0 s | 3,0 s |
| 02 | **Désir** — la ligne s'ouvre sur la berline, les 5 voitures de l'accessible au premium, gros plan « Sélectionnée / préparée » | 90–330 | 3,0–11,0 s | 8,0 s |
| 03 | **Simplicité** — carrousel de sélection → la RAV4 roule du lieu à l'horaire → clés en pendule | 330–480 | 11,0–16,0 s | 5,0 s |
| 04 | **Territoire** — contour du Québec tracé en lumière, onde depuis Montréal, PARTOUT AU QUÉBEC | 480–615 | 16,0–20,5 s | 4,5 s |
| 05 | **Marque** — silence, ligne, logo animé, signature, URL, tenue | 615–810 | 20,5–27,0 s | 6,5 s |

Chaque changement de scène tombe sur la grille du tempo : 120 BPM, 1 temps = 15 frames.

### Moments clés

1. **La voiture qui efface le comptoir.** La photo du GLE traverse l'écran de droite à gauche ; le monde sombre est révélé derrière elle. Le flou de mouvement est proportionnel à la vitesse instantanée.
2. **La ligne qui s'ouvre sur la voiture.** La ligne de lumière devient un volet et révèle la berline dans la nuit.
3. **De l'accessible au premium.** Cinq coupes sur le tempo, avec le nom du modèle (texte seulement), une progression carmin et la mention « selon disponibilité ».
4. **Gros plan sur la K4.** Poussée lente sur la photo pleine résolution, avec un reflet de lumière qui balaie la carrosserie et révèle « préparée. ».
5. **Le Québec s'allume.** Le contour de la province se trace, puis une onde partie de Montréal l'allume point par point.
6. **La province qui devient la ligne du logo.** La carte s'écrase en une ligne qui monte sous le logo : les piliers en sortent, les arcs se dessinent, puis MAISON / AUTOMOBILE.

---

## Texte exact affiché à l'écran

| Temps | Texte |
|---|---|
| 0,1 s | **PAS DE / COMPTOIR.** |
| 1,1 s | **PAS DE / FILE.** (« FILE. » en carmin) |
| 3,6 s | *la bonne* · **VOITURE** |
| 5,6 s | **DE L'ACCESSIBLE / AU PREMIUM.** · `Kia K4` → `Audi A3` → `Toyota RAV4` → `Mercedes-Benz GLE` → `Porsche Cayenne` · `SELON DISPONIBILITÉ` |
| 9,0 s | **SÉLECTIONNÉE.** |
| 9,8 s | *préparée.* |
| 11,1 s | **CHOISISSEZ.** |
| 12,8 s | **ON COORDONNE.** · `VOTRE LIEU` · `VOTRE HORAIRE` |
| 14,6 s | *prenez* · **LES CLÉS.** |
| 16,8 s | **PARTOUT / AU QUÉBEC.** (sur la carte) |
| 17,7 s | `REMISE COORDONNÉE` · selon votre lieu et votre horaire. |
| 21,5 s | **MAISON / AUTOMOBILE** (logo) |
| 23,1 s | Votre voiture. · Là où vous en avez besoin. |
| 23,7 s | `PARTOUT AU QUÉBEC` |
| 24,6 s | `maisonautomobile.ca` |

Le texte flotte sur des panneaux de verre. Le texte essentiel reste hors des zones couvertes par l'interface Reels / TikTok.

---

## Voix off

12 répliques + 1 (13) générées avec ElevenLabs, voix **Maggie**, placées à la frame par `src/lib/vo.ts` (`voLines: true` par défaut). Préparation : `scripts/prepare_vo.sh` (silence de tête coupé, queue naturelle gardée, −18 LUFS, légère compression, fondus de 15 / 120 ms). La musique baisse d'environ 7 dB pendant tout le passage parlé (sans remonter entre les phrases).

| Début | Réplique | Calé sur |
|---|---|---|
| 0,1 s | Pas de comptoir. | « COMPTOIR. » |
| 1,2 s | Pas de file. | « FILE. » |
| 3,5 s | Juste la bonne voiture. | la ligne s'ouvre sur la berline |
| 5,6 s | De l'accessible au premium. | cartes de la flotte |
| 8,8 s | Sélectionnée. | « SÉLECTIONNÉE. » |
| 9,8 s | Préparée. | reflet sur la carrosserie |
| 11,1 s | Vous choisissez. | verrouillage du sélecteur |
| 12,7 s | On coordonne. | « ON COORDONNE. » |
| 14,5 s | Vous prenez les clés. | chute de la clé |
| 16,0 s | Partout au Québec. | tracé de la province |
| 17,6 s | Remise coordonnée, selon votre lieu et votre horaire. | panneau « Remise coordonnée » |
| 21,5 s | Maison Automobile. | logo |
| 23,1 s | Votre voiture. Là où vous en avez besoin. | signature |

Le silence de 20,5 s à 21,5 s est volontaire. **Ne rien dire avant « Maison Automobile ».**

Les répliques ayant été générées séparément, l'intonation repart de zéro à chaque phrase. Une **prise continue** donnerait un résultat plus naturel : voir `VOIX-OFF-ET-MUSIQUE.md`.

---

## Musique et sound design

> **PISTE TEMPORAIRE.** La musique est une composition originale, synthétisée de zéro par `scripts/generate_audio.py` (numpy), donc libre de droits. La remplacer par une piste sous licence ou une composition au même tempo (120 BPM) préserve tous les cuts. Détails et prompts : `VOIX-OFF-ET-MUSIQUE.md`.

Structure : électro minimale sombre, en ré mineur, accords Dm–B♭–F–C.

- **0–3 s :** bourdonnement froid et tic-tac.
- **3 s :** drop (impact), kick, basse pulsée, pad.
- **11 s :** arpège avec écho en croche pointée.
- **16 s :** montée en énergie, **19,5 s :** riser.
- **20,5 s :** coupure, silence.
- **21,5 s :** coup de marque et accord tenu.

Les effets sonores sont des one-shots placés à la frame (`src/lib/cues.ts`).

---

## Assets utilisés

| Asset | Source |
|---|---|
| Archivo (variable) | Google Fonts, OFL — `public/fonts/archivo-var.woff2` |
| Photos des 5 véhicules | maisonautomobile.ca, fournies par le client — `public/cars/` (après floutage) |
| Logo | SVG officiel fourni par le client — `public/brand/maison-automobile-logo.svg` |
| Contour du Québec | frontières publiques (`click_that_hood`) — `src/lib/quebec.ts` |
| Voix off | ElevenLabs, voix Maggie — `public/audio/vo/` |
| Musique + SFX | Générés — `scripts/generate_audio.py` → `public/audio/` |

## Architecture

```
src/
  Root.tsx              composition LaunchFilm (1080×1920, 810 f)
  LaunchFilm.tsx        montage des 5 scènes + grain + audio + voix off
  lib/theme.ts          palette, typo (Archivo), easings, grille tempo, timeline maître
  lib/cues.ts           feuille de sound design (frames)
  lib/vo.ts             feuille de voix off (frames) + ducking de la musique
  lib/quebec.ts         contour de la province    lib/logo-paths.ts   tracés du logo
  components/           CarPhoto, Glass (+ GlassLabel), Logo, QueueBarriers, KineticText,
                        BeatImpact, Grain
  scenes/               S1Hook … S5Brand
scripts/                prepare_cars.py, prepare_vo.sh, master.mjs, generate_audio.py
```

- **Déterminisme :** l'animation dépend uniquement de `useCurrentFrame()`, sans CSS animation ni horloge réelle. Le grain utilise `feTurbulence`, avec une graine dérivée de la frame.
- **Autres formats :** toute la timeline est dans `T` (`theme.ts`) et chaque scène est autonome. Pour un 1:1 ou un 16:9, enregistrer une nouvelle `<Composition>` et ajuster les positions verticales des scènes.

---

## Améliorations qui feraient une vraie différence

1. **Photos originales** (plus grandes que celles du site, idéalement 3000 px et plus), pour des zooms plus nets sur les cartes de la flotte.
2. **Prise de voix continue** de tout le texte, pour une intonation qui enchaîne d'une phrase à l'autre.
3. **Musique finale** composée ou sous licence, à 120 BPM, avec la même structure : drop à 3 s, coupure à 20,5 s, coup à 21,5 s.
4. **Déclinaisons 1:1 et 16:9** pour Meta Feed et YouTube, et une version courte de 15 s.
