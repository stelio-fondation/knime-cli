# Spécification du Design : Commande info v1.3 (Nodes)

Ce document définit l'ajout de la liste des nœuds dans la commande `info`.

## Objectifs
- Lister tous les nœuds configurés dans le workflow.
- Afficher l'ID et le nom de chaque nœud.
- Fournir un décompte total des nœuds.

## 1. Analyse du fichier workflow.knime
Le parser doit chercher le chemin suivant dans l'objet JSON (issu du XML) :
`config` -> `config` (où `@_key="nodes"`) -> `config` (liste des nœuds).

### Données à extraire par nœud
- `id` : L'identifiant numérique du nœud.
- `node_settings_file` : Utilisé pour extraire le nom (ex: "CSV Reader (#1)/settings.xml" -> "CSV Reader").

## 2. Format d'affichage
```text
=== Nodes (Total: 3) ===
[1] Table Creator
[2] CSV Reader
[3] Excel Writer
```

## 3. Mise à jour des Samples
Le workflow `wf_simple` sera enrichi avec une structure XML contenant ces nœuds pour valider l'implémentation.

## Auto-Review
- [x] Gestion des workflows sans nœuds (empty state).
- [x] Nettoyage robuste des noms de fichiers vers noms de nœuds.
