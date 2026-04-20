# Liste des nœuds dans Info Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extraire et afficher les nœuds du workflow.

---

### Task 1: Enrichissement des Samples

- [ ] **Step 1: Mettre à jour samples/wf_simple/workflow.knime**
Ajouter une structure XML contenant des nœuds de test.

### Task 2: Développement de la fonction de listing

- [ ] **Step 1: Mettre à jour src/commands/info.ts**
Implémenter le parsing du bloc `nodes` et l'affichage formaté.

### Task 3: Validation

- [ ] **Step 1: Compiler le projet**
Run: `npm run build`

- [ ] **Step 2: Tester la commande**
Run: `knime info -w samples/wf_simple`
