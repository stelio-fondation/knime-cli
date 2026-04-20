# Enrichissement de la commande Info Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extraire les métadonnées KNIME et mutualiser la détection des workflows.

---

### Task 1: Dépendances et Utilitaires

- [ ] **Step 1: Installer fast-xml-parser**
Run: `npm install fast-xml-parser`

- [ ] **Step 2: Créer src/utils/workflow.ts**
Implémenter `detectWorkflow` et `resolveWorkflowPath`.

- [ ] **Step 3: Refactoriser src/commands/run.ts**
Remplacer la logique locale par l'appel à l'utilitaire.

### Task 2: Parsing des métadonnées XML

- [ ] **Step 1: Créer un échantillon de test réaliste**
Mettre à jour `samples/wf_simple/workflow.knime` avec un XML minimal contenant `author` et `name`.

- [ ] **Step 2: Mettre à jour src/commands/info.ts**
Implémenter l'extraction des champs XML et l'affichage enrichi.

### Task 3: Validation

- [ ] **Step 1: Compiler le projet**
Run: `npm run build`

- [ ] **Step 2: Tester la commande**
Run: `knime info -w samples/wf_simple`
