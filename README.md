# Trail Compare Frontend

## Configuration

Créez un fichier `.env` à la racine du projet (même niveau que `package.json`).

Variables d’environnement requises :

- `VITE_BACKEND_BASE_URL` : URL de base de l’API backend.
  - Exemple : `VITE_BACKEND_BASE_URL=http://localhost:3000`

Variables auth/session :

- Aucune variable d’environnement supplémentaire n’est requise côté frontend pour l’authentification.
- Les jetons de session admin sont stockés en `localStorage` avec les clés :
  - `admin_access_token`
  - `admin_refresh_token`

## Flow admin (login / refresh / logout)

1. **Login admin**
   - Le frontend envoie `POST /api/admin/auth/login` avec les identifiants.
   - Le backend retourne `accessToken` + `refreshToken`.
   - Les tokens sont persistés en localStorage.

2. **Refresh session admin**
   - Lors d’un `401` sur un endpoint `/api/admin/*`, le client tente automatiquement `POST /api/admin/auth/refresh` avec le `refreshToken`.
   - Si le refresh réussit, les nouveaux tokens remplacent les anciens, puis la requête initiale est rejouée.
   - Si le refresh échoue, les tokens sont supprimés (session invalidée).

3. **Logout admin**
   - Le frontend supprime les tokens locaux via la logique de session.

## Endpoints utilisés

### Public

- `GET /api/races`
- `GET /api/races/:id`

### Auth admin

- `POST /api/admin/auth/login`
- `POST /api/admin/auth/refresh`

### Admin races

- `POST /api/admin/races`
- `PUT /api/admin/races/:id`
- `PATCH /api/admin/races/:id`
- `DELETE /api/admin/races/:id`

## Lancement local

1. Installer les dépendances :

```bash
npm install
```

2. Créer `.env` (voir `.env.example`).

3. Lancer en développement :

```bash
npm run dev
```

4. (Optionnel) Exécuter les tests :

```bash
npm test
```
