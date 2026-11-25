# League Master · Exploration visuelle (PRD)

## Original problem statement
Brief utilisateur « League Master · Exploration visuelle sur Emergent » (Prompt 1 retenu pour ce passage) :
Crée dans l’aperçu Emergent une démo interactive en français de League Master, un jeu de collection de cartes situé dans l’univers Cross League. Refonte visuelle et ergonomique ambitieuse. Logos, packshot et deux portraits officiels d’AETxTizow fournis. État et tirages simulés dans le navigateur, remise à zéro simple, profil fictif uniquement.
Deux compositions via un sélecteur discret : « Table de collection » (graphite, lumière or chaude, reflets, profondeur) et « Arène Cross League » (sportive, cadrage vertical, éclairage latéral argenté, accents or, blasons intégrés).
Booster dans la scène, relief qui suit le pointeur + réaction au toucher, glissement horizontal réserve gratuite → booster d’équipe → journalier Pro, commandes visibles et clavier. Ouvrir, réserve 3/10 et minuteur lisibles au premier regard. Navigation globale (Ouverture en entrée principale) + accès compact aux récompenses de niveau.
Parcours Ouverture → Révélation → Récapitulatif → Classeur, même tirage : 5 cartes Commun, Rare, Rare, Épique, Unique ; XP par carte ; rareté minimale garantie et chance de la dépasser (progression entre les deux Rares) ; dernière carte retournée, au moins Brillante, portrait Unique. Journalier Pro séparé, 10 cartes. Lumière/effets selon rareté, portraits préchargés, rythme libre. Récap → Classeur. Couleurs de rareté pour les cartes, or réservé aux commandes et à la marque. Vérifier 390×844 et ordinateur, tactile, clavier, mouvement réduit.
Prompt 2 (reste du jeu : Accueil, Marché, Boutique, Sac, Succès, Classements) prévu en deuxième passe.

## Architecture
- Frontend seul (React CRA + Tailwind + framer-motion + lenis). Aucun appel backend.
- État : `src/state/game.js` (useReducer + localStorage `lm-demo-v1`), données : `src/data/game.js`.
- Pages : `pages/Ouverture.jsx` (SceneTable / SceneArena), `Revelation.jsx`, `Recap.jsx`, `Classeur.jsx`.
- Composants : Tilt, GameCard/CardBack/Silhouette, Booster, BoosterCarousel, OpenPanel, LevelChip (+ feuille Récompenses), Chrome (TopBar, sélecteur de direction, réglages, Dock).
- Visuels du kit optimisés en webp dans `public/assets/`.

## Personas
- Équipe produit / design League Master qui compare deux directions.
- Joueur Cross League (mobile en priorité) qui ouvre ses boosters.

## Implémenté (2026-11-25)
- Deux directions commutables (Table / Arène), polices et lumières propres à chacune.
- Carrousel de boosters (glissement, flèches, points, ← →), inclinaison pointeur + pression tactile, animation d’ouverture.
- Réserve 3/10 + minuteur de recharge réel, booster d’équipe, journalier Pro (10 cartes, non ouvrable).
- Niveau/XP + récompenses récupérables (CC, booster d’équipe).
- Révélation 5 cartes (Espace/Entrée/→, toucher), XP, minimum garanti et chance (22 % → 31 % à minimum égal), dernière carte face cachée, retournement, burst Unique.
- Récapitulatif en éventail, lien vers le Classeur avec cartes du tirage mises en avant.
- Classeur : filtres équipe/rareté/finition/possession, silhouettes, numéros de variante, détail ouvrable/fermable.
- Mouvement réduit (réglage + préférence système), remise à zéro de la démo.

## Backlog
- P0 (Prompt 2) : Accueil, Marché, Boutique, Sac, Succès, Classements dans la direction retenue.
- P1 : Classeur plus compact sur mobile (filtres repliables), autres joueurs AETHRA.
- P2 : sons d’ouverture, retour haptique plus riche.

## Next tasks
- Attendre le choix de direction de l’utilisateur puis lancer Prompt 2.
