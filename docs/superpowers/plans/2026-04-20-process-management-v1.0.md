# Gestion des Processus Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Suivre et arrêter les exécutions KNIME.

---

### Task 1: Registre et Persistance

- [ ] **Step 1: Créer src/utils/registry.ts**
Module pour gérer `.knime-cli/executions.json`.

### Task 2: Intégration dans les commandes

- [ ] **Step 1: Mettre à jour src/commands/run.ts**
Appeler le registre lors du lancement.

- [ ] **Step 2: Mettre à jour src/commands/status.ts**
Implémenter l'affichage du registre avec vérification du PID.

- [ ] **Step 3: Mettre à jour src/commands/stop.ts**
Implémenter la logique de kill.

### Task 3: Validation

- [ ] **Step 1: Compiler le projet**
Run: `npm run build`

- [ ] **Step 2: Tester le cycle complet**
Lancer un run, vérifier le status, faire un stop.
