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
*   ⚖️ **Comparaison (Diff)** : Comparez deux versions d'un workflow pour voir les nœuds et variables ajoutés ou modifiés.
*   📄 **Reporting & Doc** : Générez des rapports Markdown complets et des diagrammes de flux **Mermaid.js**.
*   🤖 **AI-Ready** : Inclut une "Skill Specification" pour permettre aux agents IA de piloter vos workflows.

---

## 🛠 Installation

Installez l'outil globalement depuis GitHub :

```bash
# Installe knime et l'alias knime-cli
npm install -g stelio-fondation/knime-cli
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
```

### 2. Comparer deux workflows
```bash
knime diff --w1 Workflow_V1 --w2 Workflow_V2
knime diff --w1 Workflow_V1 --w2 Workflow_V2 --html rapport.html # Diff graphique HTML
```

### 3. Exécuter un workflow
```bash
knime run -w MonWorkflow
knime run -w MonWorkflow --server --params '{"var1": "val1"}'
```

### 4. Générer des rapports
```bash
knime report -w MonWorkflow -o MON_RAPPORT.md
knime doc -w MonWorkflow # Génère un README.md avec diagramme Mermaid
```

### 5. Live Pilot 🚀
Pilotez votre workflow en temps réel :
```bash
# Démarre le serveur sur le port 3030
knime live -w MonWorkflow

# Modifier une variable via PowerShell
Invoke-RestMethod -Method Post -Uri "http://localhost:3030/pilot" `
  -ContentType "application/json" `
  -Body '{"action": "update_variable", "data": {"name": "ma_var", "value": "nouveau"}}'
```

---

## 🤖 AI Agent & Skill Support

Ce projet est conçu pour être piloté par des agents IA (Claude Code, Antigravity, etc.). Il inclut un fichier `SKILL.md` et `AGENTS.md` pour une intégration immédiate.

---

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une Issue ou une Pull Request.

## 📄 Licence

Distribué sous la licence MIT. Voir `LICENSE` pour plus d'informations.

---
*Développé avec ❤️ pour la communauté KNIME.*
