# Fonctionnalités par Rôle (Company & Student)

Ce document détaille les actions possibles pour les utilisateurs connectés en tant qu'entreprise ("Company") et étudiant ("Student"), sur la base de la spécification OpenAPI (`archi-front/openapi-spec.json`).

---

## 🏢 En tant que "Company" (Entreprise)

Les entreprises ont accès à des outils de gestion de leur profil, de publication d'offres et de suivi des candidatures.

### 📄 Gestion du Profil
- **Consulter son profil** : Accès aux informations publiques et privées de l'entreprise via `/companies/{id}/profile`.
- **Modifier son profil** : Mise à jour des informations de l'entreprise (nom légal, SIRET, description, secteur, etc.) via `/companies/{id}/profile`.

### 💼 Gestion des Offres
- **Créer une offre** : Publier de nouvelles opportunités de travail via `/companies/{id}/offers`.
- **Modifier une offre** : Mettre à jour les détails d'une offre existante (titre, description, salaire, etc.) via `/offers/{id}`.
- **Supprimer une offre** : Retirer définitivement une offre de la plateforme via `/offers/{offerId}`.
- **Publier une offre** : Passer le statut d'une offre à "publié" via `/offers/{offerId}/publish`.
- **Clôturer une offre** : Fermer le recrutement pour une offre via `/offers/{offerId}/close`.
- **Lister ses offres** : Voir toutes les offres créées par l'entreprise via `/companies/{id}/offers`.

### 📩 Gestion des Candidatures
- **Consulter les candidatures** : Voir tous les étudiants ayant postulé à une offre spécifique via `/offers/{offerId}/applications`.

### 🔐 Compte & Sécurité
- **Supprimer son compte** : Possibilité de supprimer le compte utilisateur via `/users/{id}/account`.

---

## 🎓 En tant que "Student" (Étudiant)

Les étudiants peuvent gérer leur profil professionnel, explorer les offres et postuler.

### 📄 Gestion du Profil
- **Consulter son profil** : Accès à ses informations personnelles, compétences et expériences via `/students/{userId}/profile`.
- **Modifier son profil** : Mise à jour du CV, de la biographie, des compétences, etc. via `/students/{userId}/profile`.

### 🔍 Recherche & Exploration
- **Lister toutes les offres** : Explorer l'ensemble des opportunités disponibles sur la plateforme via `/offers`.
- **Consulter le détail d'une offre** : Voir les informations complètes d'une mission spécifique via `/offers/{offerId}`.

### 📩 Candidatures
- **Postuler à une offre** : Envoyer sa candidature pour une offre via `/offers/{offerId}/apply`.
- **Suivre ses candidatures** : Voir la liste de toutes les offres auxquelles l'étudiant a postulé via `/students/{studentId}/applications`.
- **Annuler une candidature** : Retirer sa candidature pour une offre spécifique via `/applications/{applicationId}`.

### 🔐 Compte & Sécurité
- **Supprimer son compte** : Possibilité de supprimer le compte utilisateur via `/users/{id}/account`.

---

## 🛠️ Fonctionnalités Communes
- **Inscription** : Les deux rôles peuvent s'inscrire via les endpoints dédiés (`/auth/register/company` ou `/auth/register/student`).
- **Connexion** : Authentification via `/auth/login`.
- **Mot de passe oublié** : Demande de réinitialisation (`/auth/request-password-reset`) et réinitialisation effective (`/auth/reset-password`).
- **Tests** : Accès à des endpoints de test spécifiques pour vérifier les rôles (`/test/student`, `/test/company`, etc.).
