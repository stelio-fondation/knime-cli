# 🚀 KNIME CLI

> [!IMPORTANT]
> **WINDOWS USERS**: NEVER use PowerShell (`pwsh` or `powershell`) to execute this CLI. Always use `cmd.exe` or `knime.cmd`. If you encounter permission errors, use the provided safe launcher: `.\knime-safe.bat`.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

**KNIME CLI** est un outil en ligne de commande puissant conçu pour automatiser, exécuter et documenter vos workflows KNIME. Que vous travailliez en local ou via un KNIME Server, ce CLI simplifie votre flux de travail data.

---

## ✨ Fonctionnalités clés

*   🏃 **Exécution flexible** : Lancez vos workflows en mode local (Batch) ou à distance sur un KNIME Server via API REST.
*   📝 **Documentation Automatique** : Générez des rapports Markdown et des diagrammes de flux **Mermaid.js** directement depuis vos fichiers de workflow.
*   🔍 **Analyse & Validation** : Inspectez les métadonnées, listez les nœuds et validez l'intégrité de vos projets (détection de cache volumineux).
*   📊 **Monitoring** : Suivez vos exécutions en cours avec un tableau de bord des processus (PID, temps écoulé).
*   🤖 **AI-Ready** : Inclut une "Skill Specification" pour permettre aux agents IA (Claude Code, etc.) de piloter vos workflows.

---

## 🛠 Installation

Installez l'outil globalement depuis GitHub :

```bash
npm install -g stelio-fondation/knime-cli
```

### 🛡️ Compatibilité & Sécurité
Le CLI est conçu pour être **Antivirus-friendly**. Il n'utilise aucun shell intermédiaire (PowerShell ou CMD) pour ses opérations internes, ce qui évite les blocages de sécurité courants sur Windows.

---

## ⚙️ Configuration

Avant de commencer, configurez vos chemins d'accès :

```bash
# Définir le chemin vers l'exécutable KNIME local
knime config set local.knimePath "C:\Program Files\KNIME\knime.exe"

# (Optionnel) Configurer l'accès au KNIME Server
knime config set server.url "https://votre-serveur-knime.com"
knime config set server.username "votre-login"
```

---

## 📖 Utilisation

### 1. Analyser un workflow
Obtenez instantanément la liste des nœuds et les métadonnées d'un fichier `.knwf` ou d'un dossier :
```bash
knime info -w MonWorkflow.knwf
```

### 2. Exécuter un workflow
```bash
# Exécution locale
knime run -w MonWorkflow

# Exécution sur le serveur
knime run -w MonWorkflow --server
```

### 3. Générer la documentation
Créez un `README.md` avec un diagramme de flux automatiquement :
```bash
knime doc -w MonWorkflow
```

### 4. Live Pilot (Expérimental 🚀)
Pilotez votre workflow ouvert dans KNIME en temps réel via une API :
```bash
# Démarre le serveur de pilotage
knime live -w MonWorkflow

# Envoyez une commande via API (ou laissez l'IA le faire)
# Exemple : Ajouter une annotation à [500,500]
Invoke-RestMethod -Uri "http://localhost:3000/pilot" -Method Post -Body '{"action":"add_annotation", "data":{"text":"Piloté par IA !", "x":500, "y":500}}' -ContentType "application/json"
```

### 5. Gérer les exécutions
```bash
# Voir ce qui tourne
knime status

# Arrêter une exécution
knime stop --pid 1234
```

---

## 🤖 AI Agent & Skill Support (OpenCode)

Ce projet est conçu pour être utilisé par des agents IA. Il inclut un fichier `SKILL.md` qui permet à des outils comme **Claude Code** ou **Antigravity** de comprendre et d'exécuter les commandes automatiquement.

### Comment l'utiliser comme Skill :
1. **Importation** : Si vous utilisez un agent, pointez-le simplement sur ce dépôt ou clonez-le. L'agent détectera le fichier `SKILL.md`.
2. **Automatisation** : Vous pouvez demander à l'IA :
   - *"Analyse ce workflow et génère la documentation"*
   - *"Lance l'exécution de tous les workflows du dossier samples sur le serveur"*
   - *"Vérifie s'il y a des fichiers de cache trop gros dans mes projets"*

---

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une Issue ou une Pull Request.

## 📄 Licence

Distribué sous la licence MIT. Voir `LICENSE` pour plus d'informations.

---
*Développé avec ❤️ pour la communauté KNIME.*
