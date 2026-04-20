# Spécification du Design : Evolution Majeure (Config, UI & Server)

Ce document définit les fondations pour les prochaines fonctionnalités avancées.

## 1. Gestion de la Configuration
Utilisation de la bibliothèque `conf` pour gérer la persistance des paramètres utilisateurs de manière sécurisée et cross-platform.
- Clés : `local.knimePath`, `server.url`, `server.username`, `server.password`.

## 2. Système UI
- **Couleurs** : `chalk` pour une distinction claire des messages.
- **Spinners** : `ora` pour le feedback visuel pendant les opérations longues (parsing ZIP, requête API).
- **Tableaux** : `cli-table3` pour une mise en forme structurée des listes.

## 3. Architecture KNIME Server
- Client REST basé sur `axios`.
- Injection des credentials depuis la `config`.
- Mode asynchrone par défaut (soumission de job).

## Auto-Review
- [x] Sécurité : Le mot de passe serveur sera stocké localement, mais nous pourrions envisager l'utilisation de variables d'environnement pour plus de sécurité.
- [x] UX : La configuration locale évitera de saisir `--knime-path` à chaque fois.
