# Shibui - Plateforme de Recrutement Étudiant

Shibui est une plateforme web moderne conçue pour connecter les étudiants en quête de stages ou d'emplois avec les entreprises à la recherche de nouveaux talents.

L'application frontend est construite avec **Vue 3**, **TypeScript** et **Vite**, offrant une expérience utilisateur fluide et des performances optimales.

## Installation et Lancement

Pour démarrer le projet localement, suivez ces étapes :

### Prérequis
- [Node.js](https://nodejs.org/) (version 18 ou supérieure recommandée)
- Un gestionnaire de paquets (npm, yarn ou pnpm)

### Étapes
1.  Installez les dépendances :
    ```bash
    npm install
    ```
2.  Lancez le serveur de développement :
    ```bash
    npm run dev
    ```
3.  Ouvrez votre navigateur à l'adresse `http://localhost:5173` (ou l'URL indiquée dans votre terminal).

---

## Configuration

L'application utilise des variables d'environnement définies dans le fichier `.env` à la racine de `archi-front`.

-   **`VITE_API_URL`** : L'URL de base du backend API (par défaut : `https://archi-rendu-4.onrender.com`).
-   Pour un environnement local avec le backend lancé sur le port 3000, utilisez : `VITE_API_URL=http://localhost:3000`.

---

## Architecture du Projet

Le projet est structuré selon les principes de l'**Atomic Design** pour assurer une modularité et une réutilisabilité maximales.

### Composants (`src/components/`)
-   **`/atoms`** : Les éléments de base indivisibles (boutons, inputs, icônes, badges).
-   **`/molecules`** : Combinaisons simples d'atomes (ex: un champ de recherche avec son bouton).
-   **`/organisms`** : Composants complexes et autonomes (ex: cartes d'offres, header global, modals).
-   **`/templates`** : Structures de mise en page réutilisables (`MainLayout.vue`).

### Gestion de l'État (`src/stores/`)
Utilisation de **Pinia** pour centraliser les données de l'application :
-   `authStore` : Authentification, rôles (étudiant/entreprise) et sessions.
-   `offerStore` : Gestion des offres d'emploi (liste, filtres, détails).
-   `applicationStore` : Suivi des candidatures.
-   `companyStore` & `studentStore` : Profils et informations croisées.

### Autres dossiers clés
-   **`/views`** : Les pages complètes de l'application connectées au routeur.
-   **`/composables`** : Logique métier partagée (ex: appels API, gestion de l'auth).
-   **`/types`** : Interfaces TypeScript globales et enums.

---

## Intégration API & OpenAPI SDK

Le frontend communique avec l'API backend via un SDK généré automatiquement à partir de la spécification **Swagger/OpenAPI** (`openapi-spec.json`).

### Pourquoi utiliser un SDK OpenAPI ?
1.  **Synchronisation Totale** : Le frontend et le backend partagent les mêmes définitions de données.
2.  **Typage Fort** : Toutes les requêtes et réponses sont typées automatiquement en TypeScript, réduisant drastiquement les erreurs au moment de l'exécution.
3.  **Maintenance simplifiée** : Pas besoin d'écrire manuellement des fonctions `fetch` complexes ou de définir des interfaces d'API à la main.

### Comment mettre à jour le SDK ?
Si le backend évolue (ajout de routes ou changement de modèles) :
1.  Téléchargez la nouvelle spécification OpenAPI (`swagger.json`) du backend.
2.  Placez-la à la racine de `archi-front` sous le nom `openapi-spec.json`.
3.  Lancez la commande suivante pour régénérer le SDK :
    ```bash
    npm run openapi-ts
    ```
Le nouveau SDK sera alors disponible dans `src/openApi/`.

---

## Design System

L'identité visuelle de Shibui est définie centralement dans `src/style.css` via des variables CSS (`--shibui-orange`, `--shibui-gray`, etc.). 

Le design system suit une approche minimaliste et moderne ("Shibui" signifiant une esthétique simple et subtile en japonais), garantissant une cohérence visuelle sur l'ensemble de la plateforme.

---

## Maintenance et Évolution

-   **Ajouter une page** : Créez un composant dans `src/views` et ajoutez la route correspondante dans `src/router/index.ts`.
-   **Ajouter un composant** : Choisissez le niveau atomique approprié (`atoms`, `molecules` ou `organisms`) pour maintenir la structure du design system.
-   **Vérifier les types** : Utilisez `npm run type-check` pour s'assurer de l'absence d'erreurs TypeScript dans tout le projet.
