# Spécification du Design : Initialisation du Projet knime-cli

Ce document définit les étapes pour initialiser techniquement le projet `knime-cli` et mettre en place un environnement de test robuste.

## Objectifs
- Assurer que le projet est compilé et disponible globalement via la commande `knime`.
- Créer une structure de données de test représentative pour valider les commandes de scan et d'exécution.

## 1. Configuration Technique
Les commandes suivantes seront exécutées dans l'ordre :
1. `npm install` : Installation des dépendances (`commander`, `typescript`, etc.).
2. `npm run build` : Compilation du TypeScript vers JavaScript (`dist/`).
3. `npm link` : Création d'un lien symbolique global pour permettre l'exécution de `knime`.

## 2. Structure des Tests (`samples/`)
Un dossier `samples/` sera créé à la racine du projet avec la hiérarchie suivante :

| Chemin | Type | Description |
|--------|------|-------------|
| `samples/wf_simple/` | Workflow | Test de base (un seul workflow). |
| `samples/wf_simple/workflow.knime` | Fichier | Marqueur de validité KNIME. |
| `samples/group_prod/` | Dossier | Test de regroupement/récursivité. |
| `samples/group_prod/wf_heavy/` | Workflow | Test de hiérarchie niveau 1. |
| `samples/group_prod/wf_heavy/workflow.knime` | Fichier | |
| `samples/invalid_dir/` | Dossier | Test de robustesse (ne doit pas être listé comme workflow). |

## 3. Plan de Validation
Après l'initialisation, nous validerons :
1. L'accès à la commande : `knime --version`.
2. Le scan de base : `knime list -p ./samples`.
3. Le scan récursif : `knime list -p ./samples -r`.

## Auto-Review
- [x] Pas de sections "TBD" ou "TODO".
- [x] Cohérence entre les commandes système et la structure des fichiers.
- [x] Portée limitée à l'initialisation et aux tests de base.
- [x] Ambiguïtés levées sur la définition d'un "workflow valide" (présence de `workflow.knime`).
