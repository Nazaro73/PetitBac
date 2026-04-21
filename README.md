# Petit Bac — Édition Maître du Jeu

Un Petit Bac multijoueur temps réel avec une architecture **asymétrique** :

- Le **Maître du Jeu (MJ)** héberge le serveur localement via Docker.
- Les **Joueurs** rejoignent la partie depuis une interface web déployée sur Vercel.
- Un tunnel **Ngrok** expose le backend local en HTTPS pour satisfaire les politiques CORS/Mixed-Content du navigateur.

## Architecture

```
┌──────────────────────┐      WebSocket (HTTPS)      ┌─────────────────────────────────┐
│  Frontend (Vercel)   │ ───────────────────────────▶│  Ngrok tunnel (cloud)           │
│  Next.js + Socket.io │ ◀───────────────────────────│  ↓                              │
└──────────────────────┘                             │  Backend (Docker, local MJ)     │
                                                     │  Node.js + Express + Socket.io  │
                                                     └─────────────────────────────────┘
```

Toutes les données de partie sont conservées **en mémoire** sur le backend. Si le MJ arrête son conteneur, la partie est perdue.

## Structure du dépôt

```
.
├── backend/              # Serveur Node.js / Socket.io (exécuté en Docker par le MJ)
├── frontend/             # Application Next.js déployée sur Vercel
├── docker-compose.yml    # Orchestration backend + ngrok (utilisé par le MJ)
└── .env.example          # Variables d'environnement à copier en .env
```

## Démarrage rapide

### Côté Maître du Jeu (local, Docker)

1. Installer Docker Desktop.
2. Créer un compte Ngrok gratuit et récupérer le `NGROK_AUTHTOKEN` (https://dashboard.ngrok.com/get-started/your-authtoken).
3. Copier `.env.example` en `.env` puis renseigner :
   - `NGROK_AUTHTOKEN` : votre jeton.
   - `FRONTEND_URL` : l'URL Vercel déployée (ex. `https://petit-bac.vercel.app`).
4. Lancer :
   ```bash
   docker compose up --build
   ```
5. Récupérer l'URL HTTPS générée par Ngrok dans les logs (format `https://xxxx.ngrok-free.app`) et la transmettre aux joueurs.

### Côté Joueurs (navigateur)

1. Ouvrir le site Vercel.
2. Renseigner un pseudo et l'URL HTTPS fournie par le MJ.
3. Attendre que le MJ lance la partie.

### Développement local du frontend

```bash
cd frontend
npm install
npm run dev
```

### Développement local du backend (hors Docker)

```bash
cd backend
npm install
npm run dev
```

## Rôles & flux de jeu

| Phase        | MJ                                       | Joueurs                              |
|--------------|------------------------------------------|--------------------------------------|
| Lobby        | Configure catégories + lettre            | Patientent                           |
| Top départ   | Clique « Démarrer »                      | Interfaces déverrouillées            |
| Écriture     | Voit qui a terminé                       | Remplissent leur grille              |
| Stop         | Clique « STOP »                          | Interfaces verrouillées              |
| Correction   | Valide chaque mot (+0 / +1 / +2)         | Voient les points s'ajouter en live  |
| Résultats    | Classement affiché, retour au Lobby      | Consultent le classement             |

## Événements Socket.io

### Joueurs → Serveur
- `join_game` — rejoindre la salle avec un pseudo.
- `submit_words` — envoi du tableau des réponses au moment du STOP.

### MJ → Serveur
- `mj_claim` — revendiquer le rôle de MJ (premier arrivé, ou via jeton).
- `start_round` — lancer la manche avec une lettre et des catégories.
- `stop_round` — forcer le verrouillage.
- `mj_validate_word` — noter un mot (+0, +1, +2).
- `mj_apply_penalty` — retirer des points à un joueur.
- `mj_kick_player` — expulser un joueur.

### Serveur → Clients (broadcast)
- `players_update` — état courant de la salle (joueurs, scores).
- `round_started` — déverrouillage + lettre + catégories.
- `round_stopped` — verrouillage + réponses soumises (vue MJ).
- `live_correction` — mise à jour visuelle d'une case (couleur + points).
- `round_results` — tableau de scores de fin de manche.
- `kicked` — notification d'expulsion.

## Points de vigilance

- **CORS** : `FRONTEND_URL` doit correspondre exactement au domaine Vercel.
- **Reconnexion** : chaque joueur reçoit un `clientId` stocké dans `localStorage` ; en cas de refresh, il récupère son score.
- **Performances** : les saisies ne sont envoyées qu'au STOP, pas en continu.
- **Persistance** : aucune base de données, tout est en RAM.
