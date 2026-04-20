# Phase B : KNIME Server Implementation Plan

**Goal:** Permettre l'exécution de workflows sur un serveur distant via l'API REST.

---

### Task 1: Client API

- [ ] **Step 1: Installer axios**
Run: `npm install axios`

- [ ] **Step 2: Créer src/utils/server-api.ts**
Implémenter la classe `KnimeServerClient`.

### Task 2: Commande Run (Mode Server)

- [ ] **Step 1: Mettre à jour src/commands/run.ts**
Intégrer la logique de bascule `--server`.

### Task 3: Validation

- [ ] **Step 1: Simulation et tests unitaires**
Valider la logique de polling.
