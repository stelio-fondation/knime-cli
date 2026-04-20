# Spécification du Design : Gestion des Processus v1.0

Ce document définit la gestion du cycle de vie des exécutions KNIME.

## Objectifs
- Suivre les exécutions actives.
- Permettre l'arrêt sécurisé des workflows en cours.
- Assurer la persistance du statut entre les sessions du CLI.

## 1. Registre des Exécutions
### Emplacement
Le fichier sera situé dans `.knime-cli/executions.json` à la racine du projet (pour une isolation par workspace).

### Structure des données
- `id` : Identifiant unique (PID).
- `workflow` : Nom du workflow exécuté.
- `startTime` : Timestamp ISO.
- `status` : `running` | `completed` | `failed`.

## 2. Commandes
### run (Update)
- Ajoute l'entrée au démarrage.
- Met à jour le statut à la fin de l'exécution (si le CLI reste ouvert).

### status
- Parcourt le registre.
- Vérifie l'état réel via le système d'exploitation.
- Affiche un tableau formaté.

### stop
- Envoie un signal de terminaison au PID.
- Marque l'entrée comme `stopped` dans le registre.

## Auto-Review
- [x] Isolation par projet (Workspace).
- [x] Robustesse : Gestion des PIDs recyclés par l'OS (vérification du nom du processus si possible).
