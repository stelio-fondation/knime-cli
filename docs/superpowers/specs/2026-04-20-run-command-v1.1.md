# Spécification du Design : Commande run v1.1

Ce document définit les améliorations de la commande `run` pour supporter les différents formats de workflows KNIME et le mode Batch.

## Objectifs
- Supporter les fichiers exportés `.knwf` via `-workflowFile`.
- Supporter les dossiers de workflows via `-workflowDir`.
- Automatiser les arguments requis pour le mode Batch (`-nosplash`, `-application`, etc.).
- Permettre la configuration de la sauvegarde via `--save`.

## 1. Interface CLI
La commande `run` acceptera les options suivantes :
- `-w, --workflow <path>` : Chemin vers le workflow (fichier ou dossier).
- `--params <json>` : Paramètres au format JSON pour les variables de flux.
- `--save` : Sauvegarder le workflow après exécution (par défaut `-nosave`).
- `-v, --verbose` : Afficher la sortie complète de KNIME.

## 2. Logique d'Exécution
### Détection du format
- Si le chemin est un fichier se terminant par `.knwf` $\rightarrow$ `-workflowFile`.
- Si le chemin est un dossier contenant `workflow.knime` $\rightarrow$ `-workflowDir`.

### Arguments Batch par défaut
KNIME sera invoqué avec :
- `-nosplash`
- `-application org.knime.product.KNIME_BATCH_APPLICATION`
- `-reset`
- `-nosave` (si `--save` n'est pas spécifié)

## 3. Implémentation technique
- Utilisation de `fs.statSync` pour distinguer fichier et dossier.
- Utilisation de `child_process.spawn` pour capturer la sortie.
- Mapping dynamique des paramètres JSON vers les arguments `-key` et `-value`.

## Auto-Review
- [x] Gestion des erreurs si le chemin n'est ni un fichier valide ni un dossier valide.
- [x] Respect des standards de ligne de commande KNIME.
- [x] Sécurité par défaut avec `-nosave`.
