# 🚀 KNIME CLI

> [!IMPORTANT]
> **WINDOWS USERS**: NEVER use PowerShell (`pwsh` or `powershell`) to execute this CLI. Always use `cmd.exe` or `knime.cmd`. If you encounter permission errors, use the provided safe launcher: `.\knime-safe.bat`.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

**KNIME CLI** est un outil en ligne de commande puissant conçu pour automatiser, exécuter, comparer et documenter vos workflows KNIME. Que vous travailliez en local ou via un KNIME Server, ce CLI simplifie votre flux de travail data.

---

## ✨ Fonctionnalités clés

*   🏃 **Exécution flexible** : Lancez vos workflows en mode local (Batch) ou à distance sur un KNIME Server via API REST.
*   📊 **Live Pilot** : Modifiez vos workflows en temps réel (variables, annotations) via une API REST intégrée.
*   🔍 **Analyse & Validation** : Inspectez les métadonnées, listez les nœuds, les dépendances (extensions) et validez l'intégrité de vos projets.
*   📊 **Lignage des données** : Visualisez le flux de données entre les nœuds avec la commande `lineage`.
*   🏗️ **Génération & Composition** : Créez des workflows à partir d'un prompt (`build`) ou assemblez-les nœud par nœud (`add-node`, `connect`).
*   ⚖️ **Comparaison (Diff)** : Comparez deux versions d'un workflow pour voir les nœuds et variables ajoutés ou modifiés.
*   📄 **Reporting & Doc** : Générez des rapports Markdown complets et des diagrammes de flux **Mermaid.js**.
*   🤖 **AI-Ready** : Inclut une "Skill Specification" pour permettre aux agents IA de piloter vos workflows.

---

## 🛠 Installation

Installez l'outil globalement depuis GitHub (en utilisant l'URL tarball pour éviter un bug de symlink connu de NPM sur Windows) :

```bash
# Installe knime et l'alias knime-cli
npm install -g https://github.com/stelio-fondation/knime-cli/tarball/master
```

### 📋 Pré-requis
- **Node.js** >= 18.0.0
- **KNIME Analytics Platform** (pour l'exécution locale) ou accès à un **KNIME Server**.

---

## ⚙️ Configuration

Configurez vos chemins d'accès pour activer l'exécution locale :

```bash
# Définir le chemin vers l'exécutable KNIME local
knime config set local.knimePath "C:\Program Files\KNIME\knime.exe"
```

---

## 📖 Utilisation

### 1. Analyser & Valider
Obtenez les métadonnées et validez l'intégrité (nœuds manquants, extensions requises) :
```bash
knime info -w MonWorkflow
knime info -w MonWorkflow --json --out result.json # Export JSON
knime validate -w MonWorkflow
knime lineage -w MonWorkflow # Affiche le flux de données
```

### 2. Création & Composition 🏗️

#### Générer un workflow via un prompt
```bash
knime build -w MonAnalyse --prompt "lit un csv, filtre les lignes et écrit en excel"
```

#### Composer manuellement (Expert/Agents)
```bash
knime create MonProjet
knime add-node -w MonProjet --type "CSV Reader" --id 1
knime add-node -w MonProjet --type "GroupBy" --id 2
knime connect -w MonProjet --from 1:1 --to 2:1
```

### 3. Comparer deux workflows
```bash
knime diff --w1 Workflow_V1 --w2 Workflow_V2
knime diff --w1 Workflow_V1 --w2 Workflow_V2 --html rapport.html # Diff graphique HTML
```

### 3. Exécuter un workflow
```bash
knime run -w MonWorkflow
knime run -w MonWorkflow --server --params '{"var1": "val1"}'
knime run -w MonWorkflow --webhook http://votre-api.com/webhook # Notification de fin
```

### 4. Générer des rapports
```bash
knime report -w MonWorkflow -o MON_RAPPORT.md
knime doc -w MonWorkflow # Génère un README.md avec diagramme Mermaid
```

### 5. Live Pilot 🚀
Pilotez votre workflow en temps réel :
```bash
# Démarre le serveur et ouvre le Dashboard sur http://localhost:3030
knime live -w MonWorkflow

# Modifier une variable via PowerShell
Invoke-RestMethod -Method Post -Uri "http://localhost:3030/pilot" `
  -ContentType "application/json" `
  -Body '{"action": "update_variable", "data": {"name": "ma_var", "value": "nouveau"}}'
```

---

## 🤖 AI Agent & Skill Support

Ce projet est conçu pour être piloté par des agents IA (Antigravity/Gemini, Claude Code, Opencode, Hermes, etc.). 
Pour limiter la consommation de tokens et apprendre à votre IA comment piloter KNIME via ce CLI, vous pouvez déployer automatiquement la "Skill" ultra-condensée dans vos environnements locaux :

```bash
knime install-skill
```
*(Cette commande va scanner les dossiers de vos agents et y copier `SKILL.md` pour une intégration immédiate).*

---

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une Issue ou une Pull Request.

## 📄 Licence

Distribué sous la licence MIT. Voir `LICENSE` pour plus d'informations.

---
*Développé avec ❤️ pour la communauté KNIME.*
