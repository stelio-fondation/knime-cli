# Spécification du Design : Commande info v1.2

Ce document définit les améliorations de la commande `info` pour extraire des métadonnées riches.

## Objectifs
- Mutualiser la logique de détection des workflows.
- Parser le fichier `workflow.knime` pour extraire les métadonnées métier.
- Améliorer l'interface visuelle des informations affichées.

## 1. Structure du Code
### Nouveau module : `src/utils/workflow.ts`
Contiendra la logique partagée :
- `detectWorkflow(targetPath: string)` : Analyse si le chemin est un workflow valide.
- `resolvePath(workflow: string, basePath?: string)` : Résout le chemin absolu.

### Commande `info`
- Utilisera `fast-xml-parser` pour lire les entrées XML.
- Mappera les clés XML KNIME vers des labels lisibles.

## 2. Métadonnées cibles
KNIME stocke les données sous forme de paires `<entry key="..." value="..." />`.
Nous ciblerons :
- `customDescription`
- `name` (si différent du dossier)
- `author`
- `knime-version`

## 3. Dépendances
- `fast-xml-parser` : Pour le parsing XML robuste.

## Auto-Review
- [x] Rétrocompatibilité : La commande continue d'afficher les infos système si le XML est illisible.
- [x] Performance : Lecture seule du fichier de métadonnées (pas tout le dossier).
