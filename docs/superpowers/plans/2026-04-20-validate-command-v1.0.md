# Commande Validate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Valider l'intégrité et l'encombrement d'un workflow.

---

### Task 1: Préparation et Utilitaires

- [ ] **Step 1: Créer src/utils/fs.ts**
Implémenter `getAllFiles(dir: string)` qui retourne la liste des fichiers et leurs tailles.

- [ ] **Step 2: Mettre à jour src/commands/validate.ts**
Ajouter l'option `--threshold` et importer les utilitaires.

### Task 2: Logique de Validation

- [ ] **Step 1: Implémenter la validation structurelle**
Vérifier la cohérence entre le XML et le système de fichiers.

- [ ] **Step 2: Implémenter le scan de taille**
Identifier les fichiers dépassant le seuil.

### Task 3: Validation

- [ ] **Step 1: Compiler le projet**
Run: `npm run build`

- [ ] **Step 2: Tester la commande**
Run: `knime validate -w samples/wf_simple --threshold 0` (0 pour forcer les warnings sur nos petits fichiers de test).
