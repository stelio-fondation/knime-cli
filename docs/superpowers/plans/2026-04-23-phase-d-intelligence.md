# Phase D : Workflow Intelligence & Integrity

Ce plan vise à renforcer la fiabilité du CLI et à ajouter des outils d'analyse avancés pour les workflows KNIME.

## User Review Required

> [!NOTE]
> Pour la fonctionnalité `diff`, l'affichage se concentrera initialement sur les nœuds (ajouts/suppressions). La comparaison des paramètres internes des nœuds pourra être ajoutée plus tard.

## Proposed Changes

### 1. Robustesse du Parser
Garantir que l'extraction des données reste fiable malgré les évolutions de KNIME.

#### [NEW] [knime-parser.test.ts](file:///d:/antigravity/projet-knime-cli/src/utils/knime-parser.test.ts)
- Tests unitaires couvrant :
    - Extraction des nœuds et connexions.
    - Support des annotations.
    - Support des variables de workflow.
    - Gestion des fichiers XML malformés.

### 2. Commande `knime diff`
Comparer deux workflows pour identifier les changements structurels.

#### [NEW] [diff.ts](file:///d:/antigravity/projet-knime-cli/src/commands/diff.ts)
- Commande : `knime diff -w1 <workflow1> -w2 <workflow2>`
- Analyse les deux workflows et affiche :
    - 🟢 Nœuds ajoutés.
    - 🔴 Nœuds supprimés.
    - 🟡 Nœuds identiques mais déplacés/modifiés (basé sur l'ID).
- Utilisation de `chalk` pour un rendu clair.

### 3. Analyse des Extensions (Requirements)
Identifier les dépendances d'un workflow pour faciliter son déploiement.

#### [MODIFY] [knime-parser.ts](file:///d:/antigravity/projet-knime-cli/src/utils/knime-parser.ts)
- Extraire les informations de version et les types de nœuds.

#### [MODIFY] [validate.ts](file:///d:/antigravity/projet-knime-cli/src/commands/validate.ts)
- Ajouter une section "Requirements" affichant la liste des extensions probables nécessaires basées sur les types de nœuds présents.

## Verification Plan

### Automated Tests
- `npm run test` : Vérifier que les nouveaux tests du parser passent.
- Création d'un workflow de test "v2" dans `samples/` pour tester la commande `diff`.

### Manual Verification
- `knime diff -w MonWorkflow_v1 -w MonWorkflow_v2`
- `knime validate -w MonWorkflow` : Vérifier l'affichage des extensions requises.
