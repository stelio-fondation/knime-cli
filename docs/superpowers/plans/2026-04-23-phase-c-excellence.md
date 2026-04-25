# Phase C : Excellence & Polish

Ce plan vise à parfaire le projet en améliorant l'esthétique du CLI, en ajoutant des tests et en étendant les fonctionnalités du mode "Live Pilot".

## User Review Required

> [!IMPORTANT]
> Ce plan modifie l'affichage de plusieurs commandes pour utiliser `chalk` et `ora`. Si vous préférez une sortie brute pour le scripting, nous pourrions ajouter un flag `--json` dans le futur.

## Proposed Changes

### 1. Refonte UI (Aesthetics)
Harmoniser l'affichage de toutes les commandes avec `chalk` et `ora`.

#### [MODIFY] [info.ts](file:///d:/antigravity/projet-knime-cli/src/commands/info.ts)
Utiliser des couleurs pour distinguer les métadonnées et le système de fichiers.

#### [MODIFY] [validate.ts](file:///d:/antigravity/projet-knime-cli/src/commands/validate.ts)
Ajouter un spinner pendant le scan des fichiers volumineux et colorer les erreurs/warnings.

#### [MODIFY] [config.ts](file:///d:/antigravity/projet-knime-cli/src/commands/config.ts)
Utiliser `cli-table3` pour `config list`.

### 2. Live Pilot Enhancements
Étendre les capacités du serveur de pilotage.

#### [MODIFY] [live.ts](file:///d:/antigravity/projet-knime-cli/src/commands/live.ts)
Ajouter des endpoints pour :
- `GET /nodes` : Lister les nœuds du workflow piloté.
- `GET /variables` : Lister les variables de workflow.
- `POST /update_variable` : Modifier une variable.

### 3. Testing Infrastructure
Mettre en place une base de tests.

#### [MODIFY] [package.json](file:///d:/antigravity/projet-knime-cli/package.json)
Ajouter `jest` ou `vitest` et les types associés.

#### [NEW] [config.test.ts](file:///d:/antigravity/projet-knime-cli/src/utils/config.test.ts)
Premier test unitaire pour valider la persistance de la config.

## Verification Plan

### Automated Tests
- `npm run test` (après installation de la suite de tests).

### Manual Verification
- `knime info -w MonWorkflow` : Vérifier le rendu coloré.
- `knime config list` : Vérifier le rendu en tableau.
- `curl http://localhost:3000/nodes` : Tester les nouvelles API live.
