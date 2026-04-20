# 🚀 KNIME CLI

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

### 4. Gérer les exécutions
```bash
# Voir ce qui tourne
knime status

# Arrêter une exécution
knime stop --pid 1234
```

---

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une Issue ou une Pull Request.

## 📄 Licence

Distribué sous la licence MIT. Voir `LICENSE` pour plus d'informations.

---
*Développé avec ❤️ pour la communauté KNIME.*
