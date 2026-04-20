---
name: knime-cli
description: Gestionnaire de workflows KNIME (Analyse, Validation, Exécution, Documentation). Utilisez cette skill pour manipuler des projets KNIME localement ou via un serveur.
---

# KNIME CLI Skill

Cette skill permet à un agent d'interagir avec l'écosystème KNIME via le CLI `knime`.

## Commandes Disponibles

### 1. Analyse et Information
- `knime info -w <workflow>` : Affiche les métadonnées (auteur, version, description) et la liste des nœuds.
- `knime list -p <path>` : Liste tous les workflows présents dans un dossier.

### 2. Validation et Qualité
- `knime validate -p <workflow_path>` : Vérifie l'intégrité du workflow et détecte les fichiers de cache volumineux (données temporaires oubliées).

### 3. Exécution
- `knime run -w <workflow>` : Lance l'exécution locale en mode batch.
- `knime run -w <workflow> --server` : Lance l'exécution sur le serveur configuré (via API REST) avec polling du statut.

### 4. Gestion des Processus
- `knime status` : Affiche un tableau des exécutions locales en cours (PID, workflow, temps).
- `knime stop --all` ou `knime stop --pid <pid>` : Arrête proprement les processus KNIME lancés par le CLI.

### 5. Documentation
- `knime doc -w <workflow>` : Génère un rapport `README.md` avec un diagramme **Mermaid** du flux et les annotations de documentation.

### 6. Configuration
- `knime config set local.knimePath <path>` : Définit le chemin vers l'exécutable KNIME.
- `knime config set server.url <url>` : Définit l'URL du KNIME Server.

## Flux de travail recommandé pour l'Agent

1. **Exploration** : Utilisez `knime list` pour trouver des workflows.
2. **Analyse** : Utilisez `knime info` pour comprendre ce que fait un workflow spécifique.
3. **Validation** : Toujours lancer `knime validate` avant une exécution pour éviter de saturer le disque avec du cache.
4. **Documentation** : Utilisez `knime doc` pour tenir à jour la documentation technique dans le repo Git.

## Knowledge & Expertise
Pour agir en tant qu'expert KNIME, l'agent doit consulter :
- `docs/knowledge/RESOURCES.md` : Liens officiels et sources de vérité.
- `docs/knowledge/GUIDELINES.md` : Standards de conception et règles d'hygiène des workflows.
