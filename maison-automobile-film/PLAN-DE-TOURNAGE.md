# Plan de tournage — Maison Automobile

Tournage demain, publication après-demain. **8 plans** : un plan « héros » par voiture (5), un plan de nuit, un gros plan, et un passage facultatif.

Le film fonctionne déjà avec les photos actuelles. Chaque plan réussi **remplace sa photo**, un par un. Si un plan rate, la photo reste : rien ne bloque la publication.

## Avant de filmer

**Téléphone**
- Qualité vidéo **4K à 30 images/seconde** (pas 24, pas 60).
- **HDR vidéo désactivé** (iPhone : Réglages > Appareil photo > Enregistrer en vidéo > HDR vidéo. Android : désactiver HDR10+). Sinon les couleurs sortent délavées.
- Objectif principal (1x), **sans zoom numérique**. Nettoyer la lentille.
- Verrouiller l'exposition et la mise au point (appui long sur l'écran) pour que la luminosité ne bouge pas pendant le plan.
- Mode « Ne pas déranger », batterie chargée, assez d'espace.

**Voiture**
- Propre : carrosserie, vitres, jantes.
- **Placard MAISON AUTOMOBILE à la place de la plaque** (comme sur les photos du site).
- **Aucun logo de marque visible** : couvrir avec du **ruban adhésif noir mat** l'emblème de la calandre, du capot, du coffre et le **centre de chaque roue**. C'est plus fiable que de flouter une vidéo en mouvement.
- Pas d'autocollant ni de texte visible sur la voiture.

**Lieu et lumière**
- Aucune enseigne ni texte lisible, aucune autre plaque dans le cadre. Fond simple : mur, stationnement vide, paysage.
- Lumière douce : **la dernière heure avant le coucher du soleil**, ou ciel voilé. Éviter le plein soleil de midi (reflets durs).
- **Les 5 voitures du même côté et à la même hauteur de caméra** : le montage sera plus cohérent.

## Les plans

Pour chaque plan : garder **3 secondes immobiles au début et à la fin**, un seul mouvement, très lent (environ un pas toutes les deux secondes). Les cartes de la flotte ne durent que 0,5 s dans le film : les prises longues me laissent choisir le meilleur instant.

| Fichier | Plan | Format | Durée | Consigne |
|---|---|---|---|---|
| `k4` | Héros Kia K4 | **horizontal** 16:9 | 8 s | Trois-quarts avant, caméra à hauteur de phare. Voiture à l'arrêt. Mouvement lent (avancer d'un pas ou glisser). Garder la voiture dans les 80 % centraux du cadre. |
| `a3` | Héros Audi A3 | horizontal | 8 s | Idem. |
| `rav4` | Héros Toyota RAV4 | horizontal | 8 s | Idem. |
| `gle` | Héros Mercedes-Benz GLE | horizontal | 8 s | Idem. |
| `cayenne` | Héros Porsche Cayenne | horizontal | 8 s | Idem. C'est la dernière voiture avant le gros plan : soigner la lumière. |
| `night` | Phares allumés | **horizontal** | 6 s | Crépuscule ou nuit, fond sombre, phares et feux de jour allumés. Caméra **fixe** (trépied ou appuyée). Une seule voiture, l'A3 idéalement. |
| `macro` | Gros plan | **vertical** 9:16 | 8 s | L'avant d'une voiture : phare, aile, roue. Lumière rasante. Mouvement très lent, de bas en haut ou sur le côté. Emblèmes cachés. La K4 convient. |
| `pass` *(facultatif)* | Passage | vertical | 3 passages | Caméra **fixe** sur trépied. La voiture traverse le cadre **de droite à gauche** à environ 20 km/h, sur un lieu fermé et dégagé, avec une personne pour surveiller. |

## Livraison

1. **Nommer chaque fichier du nom du plan** : `k4.mov`, `rav4.mov`, `macro.mov`, etc. (`.mp4`, `.mov`, `.m4v` ou `.mkv`).
2. Les copier dans le dossier `maison-automobile-film/incoming/` sur l'ordinateur.
3. Lancer `node scripts/prepare_clips.mjs` : les clips sont convertis (HDR corrigé si besoin) et branchés au film. Je choisis le meilleur instant de chaque prise, puis je rends.

## Calendrier

- **Demain** : tournage. Idéalement fini avant la fin d'après-midi pour monter le soir.
- **Demain soir** : intégration des clips, rendu, mise en ligne pour validation.
- **Après-demain** : derniers ajustements, export final, publication.

## À régler avant la publication (hors tournage)

- **Musique finale** sous licence commerciale. La musique actuelle est une maquette.
- **Voix off** : une prise continue ElevenLabs donnerait une intonation plus naturelle (facultatif).
- **Zone de service** : le film dit « Partout au Québec ». Le site doit dire la même chose.
- **Contrôle final** : aucun logo ni plaque lisible, mention « selon disponibilité » présente, aucun prix.
