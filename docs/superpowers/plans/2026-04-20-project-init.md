# Initialisation du Projet Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Initialiser techniquement le projet knime-cli et mettre en place une structure de données de test pour valider les commandes.

**Architecture:** Exécution séquentielle des commandes npm pour le build et le lien global, suivie de la création d'une arborescence de fichiers factices respectant la structure attendue par la commande `list`.

**Tech Stack:** Node.js, npm, TypeScript, Command Line.

---

### Task 1: Initialisation Technique

**Files:**
- Modify: `package.json` (just for check)
- Test: CLI availability

- [ ] **Step 1: Installer les dépendances**
Run: `npm install`
Expected: Installation réussie.

- [ ] **Step 2: Compiler le projet**
Run: `npm run build`
Expected: Création du dossier `dist/` avec les fichiers `.js`.

- [ ] **Step 3: Lier le binaire globalement**
Run: `npm link`
Expected: Succès (permet d'utiliser `knime` dans le terminal).

- [ ] **Step 4: Commit**
```bash
git commit -m "chore: technical initialization (install, build, link)"
```

### Task 2: Création des Workflows de Test Simple

**Files:**
- Create: `samples/wf_simple/workflow.knime`

- [ ] **Step 1: Créer le dossier et le fichier marqueur**
Run: `mkdir samples/wf_simple; echo "" > samples/wf_simple/workflow.knime`
Expected: Dossier créé avec fichier présent.

- [ ] **Step 2: Vérifier la détection par la commande list**
Run: `node dist/index.js list -p ./samples`
Expected: Doit lister `wf_simple`.

- [ ] **Step 3: Commit**
```bash
git add samples/wf_simple
git commit -m "test: add simple workflow sample"
```

### Task 3: Création des Workflows Récursifs

**Files:**
- Create: `samples/group_prod/wf_heavy/workflow.knime`

- [ ] **Step 1: Créer l'arborescence**
Run: `mkdir -p samples/group_prod/wf_heavy; echo "" > samples/group_prod/wf_heavy/workflow.knime`
Expected: Dossier hiérarchique créé.

- [ ] **Step 2: Vérifier le scan récursif**
Run: `node dist/index.js list -p ./samples -r`
Expected: Doit lister `group_prod/wf_heavy`.

- [ ] **Step 3: Commit**
```bash
git add samples/group_prod
git commit -m "test: add recursive workflow sample"
```

### Task 4: Test de Robustesse (Dossier Invalide)

**Files:**
- Create: `samples/invalid_dir/readme.txt`

- [ ] **Step 1: Créer un dossier sans marqueur workflow.knime**
Run: `mkdir samples/invalid_dir; echo "not a workflow" > samples/invalid_dir/readme.txt`
Expected: Dossier créé sans le fichier requis.

- [ ] **Step 2: Vérifier qu'il n'est pas listé**
Run: `node dist/index.js list -p ./samples`
Expected: `invalid_dir` ne doit pas apparaître dans la liste.

- [ ] **Step 3: Commit**
```bash
git add samples/invalid_dir
git commit -m "test: add invalid directory for robustness check"
```

### Task 5: Validation Finale Globale

- [ ] **Step 1: Vérifier le binaire global**
Run: `knime --version`
Expected: `1.0.0`

- [ ] **Step 2: Test final du scan**
Run: `knime list -p ./samples -r`
Expected: Liste complète avec `wf_simple` et `group_prod/wf_heavy`.
