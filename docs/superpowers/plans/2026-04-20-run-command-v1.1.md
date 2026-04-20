# Mise à jour de la commande Run Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Améliorer la commande `run` pour supporter les dossiers, fichiers .knwf et le mode Batch automatique.

**Architecture:** Refonte de la fonction d'action dans `run.ts` pour inclure la détection de type de fichier et la construction dynamique des arguments.

**Tech Stack:** Node.js, TypeScript, Commander, Child Process.

---

### Task 1: Mise à jour des Interfaces et Options

**Files:**
- Modify: `src/commands/run.ts`

- [ ] **Step 1: Mettre à jour l'interface RunOptions**
Ajouter `save?: boolean` et ajuster les types.

- [ ] **Step 2: Ajouter l'option --save à la commande**
```typescript
.option('--save', 'Sauvegarder le workflow après exécution')
```

- [ ] **Step 3: Commit**
```bash
git add src/commands/run.ts
git commit -m "feat(run): add save option and update interfaces"
```

### Task 2: Logique de Détection de Workflow

**Files:**
- Modify: `src/commands/run.ts`

- [ ] **Step 1: Implémenter la détection du type de chemin**
Utiliser `fs.statSync` pour déterminer si c'est un fichier ou un dossier.

- [ ] **Step 2: Gérer les flags -workflowFile et -workflowDir**
Assigner le bon argument KNIME selon le type détecté.

- [ ] **Step 3: Commit**
```bash
git commit -m "feat(run): implement workflow type detection (file vs dir)"
```

### Task 3: Construction des Arguments Batch

**Files:**
- Modify: `src/commands/run.ts`

- [ ] **Step 1: Ajouter les arguments par défaut**
Inclure `-nosplash`, `-application org.knime.product.KNIME_BATCH_APPLICATION`, `-reset`.

- [ ] **Step 2: Gérer le flag -nosave**
Ajouter `-nosave` si `options.save` est faux.

- [ ] **Step 3: Commit**
```bash
git commit -m "feat(run): add automated batch mode arguments"
```

### Task 4: Validation et Build

- [ ] **Step 1: Compiler le projet**
Run: `npm run build`

- [ ] **Step 2: Tester la commande (Dry Run ou version)**
Run: `knime run --help` pour vérifier les nouvelles options.
