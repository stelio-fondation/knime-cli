# Spécification du Design : Commande validate v1.0

Ce document définit la logique de validation de l'intégrité et de l'optimisation des workflows KNIME.

## Objectifs
- Vérifier la présence de tous les fichiers requis par KNIME.
- Assurer la cohérence entre le fichier principal et les dossiers de nœuds.
- Identifier les fichiers de cache volumineux qui devraient être nettoyés avant archivage.

## 1. Algorithme de Validation
### Phase 1 : Structure
- Utiliser `resolveWorkflowPath` pour obtenir le chemin cible.
- Lire le XML via `parseWorkflowMetadata`.

### Phase 2 : Intégrité des Nœuds (Mode Dossier uniquement)
- Pour chaque nœud trouvé dans le XML :
    - Vérifier l'existence du dossier `<NodeName> (#ID)/`.
    - Vérifier l'existence de `settings.xml` dans ce dossier.

### Phase 3 : Analyse du Cache
- Parcourir récursivement les fichiers du workflow.
- Alerter si un fichier dépasse un seuil de taille (défini par `--threshold`).
- Cibler particulièrement les dossiers `data/` ou les fichiers `internal.xml`.

## 2. Interface CLI
- `-w, --workflow <name>` : Workflow à valider.
- `-p, --path <path>` : Dossier de recherche.
- `--threshold <mb>` : Seuil d'alerte pour la taille des fichiers (Défaut : 10).

## 3. Sortie
Utilisation de codes couleurs ou de symboles pour indiquer le statut de chaque étape.

## Auto-Review
- [x] Support partiel des fichiers `.knwf` (validation structurelle ZIP).
- [x] Robustesse : Ne pas s'arrêter à la première erreur pour donner un rapport complet.
