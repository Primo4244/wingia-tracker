# Voix off et musique — mode d'emploi

## 1. Voix off avec ElevenLabs

Le film est déjà prêt à recevoir la voix : il suffit de fournir **12 fichiers MP3**, un par réplique, avec les noms ci-dessous. Chaque fichier se place automatiquement au bon moment.

### Étapes

1. Aller sur **elevenlabs.io** → **Text to Speech**.
2. Choisir une voix : dans la **Voice Library**, filtrer par langue *French* et chercher un accent québécois (mots-clés : *Québécois*, *Canadian French*). Voix grave, chaude, posée. Éviter les voix « pub radio ».
3. Modèle : le plus récent multilingue proposé par défaut.
4. Réglages de départ : Stability 0,50–0,60 · Similarity 0,80 · Style 0,15–0,25 · Speaker boost activé · vitesse ≈ 0,95.
5. Coller **une réplique à la fois** (tableau ci-dessous), générer, écouter, puis **télécharger en MP3**.
6. Renommer chaque fichier selon la colonne « Fichier ».
7. Vérifier que ton forfait ElevenLabs autorise l'**usage commercial** (c'est une publicité).

### Les 12 répliques

| Fichier | Moment | Texte à coller | Durée max |
|---|---|---|---|
| `01.mp3` | 0,1 s | Pas de comptoir. | ~1 s |
| `02.mp3` | 1,1 s | Pas de file. | ~1 s |
| `03.mp3` | 3,5 s | Juste la bonne voiture. | ~2 s |
| `13.mp3` | 5,6 s | De l'accessible au premium. | ~2,2 s |
| `04.mp3` | 8,8 s | Sélectionnée. | ~1 s |
| `05.mp3` | 9,8 s | Préparée. | ~1 s |
| `06.mp3` | 11,1 s | Vous choisissez. | ~1,5 s |
| `07.mp3` | 12,7 s | On coordonne. | ~1,5 s |
| `08.mp3` | 14,5 s | Vous prenez les clés. | ~1,5 s |
| `09.mp3` | 16,0 s | Partout au Québec. | ~2 s |
| `10.mp3` | 17,7 s | Remise coordonnée, selon votre lieu et votre horaire. | ~2,7 s (finir avant 20,5 s) |
| `11.mp3` | 21,5 s | Maison Automobile. | ~1,5 s |
| `12.mp3` | 23,1 s | Votre voiture. Là où vous en avez besoin. | ~3 s |

Si une réplique dépasse sa durée, la régénérer un peu plus vite plutôt que de la couper. « Maison Automobile » se dit lentement ; « Partout au Québec. » avec assurance, appui sur *Québec*.

### Me les envoyer

Le plus fiable : sur GitHub, ouvrir le repository `Primo4244/wingia-tracker`, branche `claude/determined-brown-fxkqqy`, dossier `maison-automobile-film/public/audio/`, puis **Add file → Upload files**. Créer le sous-dossier `vo/` en tapant `vo/` avant le nom, ou déposer les 12 fichiers et me le dire : je les range.

Autre option : ajouter une clé API ElevenLabs comme secret de l'environnement (`ELEVENLABS_API_KEY`). Je pourrai alors générer et caler les 12 répliques moi-même, avec la voix que tu choisis (donne-moi son nom ou son ID).

Une fois les fichiers en place, le rendu avec voix se lance avec la prop `voLines: true`.

## 2. Musique

La piste actuelle est une maquette synthétisée par script, libre de droits. Elle reste en place tant qu'aucune autre n'est choisie.

Tout remplacement doit garder la même grille, sinon les coupes ne tombent plus sur la musique :

- **120 BPM**, durée 27 s ;
- 0–3 s : tension froide, presque rien ;
- **3 s : drop** (entrée du kick et de la basse) ;
- 3–19,5 s : pulsation régulière, montée vers 16 s ;
- 19,5–20,5 s : montée (riser) ;
- **20,5 s : coupure nette, silence** ;
- **21,5 s : un coup** puis un accord tenu jusqu'à la fin.

### Option A — bibliothèque sous licence (le plus sûr pour une pub)

Artlist, Epidemic Sound ou Musicbed. Chercher « minimal electronic », « dark tech », « premium automotive », 118–122 BPM. Me donner le fichier WAV ou MP3 : je le monte sur la grille (coupe à 20,5 s, coup à 21,5 s).

### Option B — générer avec une IA musicale

ElevenLabs Music ou Suno. Vérifier que le forfait autorise l'usage commercial. Prompt à coller :

> Minimal premium electronic track for a 27-second car rental ad. 120 BPM, D minor. 0–3 s: cold, sparse ticking pulse. At 3 s: confident drop with tight kick and pulsing sub bass. Clean, modern, Apple-like, no vocals. Gradual lift from 16 s, short riser 19.5–20.5 s, then hard cut to silence at 20.5 s. At 21.5 s: one deep cinematic hit followed by a sustained warm chord until the end.

Générer plusieurs versions et garder celle dont le drop tombe le plus près de 3 s ; je recale le reste.
