# 📜 KNIME Engineering Guidelines

Ce guide définit les standards d'excellence pour la création et la maintenance de workflows dans ce projet.

## 1. Structure et Lisibilité
- **Annotations** : Chaque section logique du workflow doit avoir une annotation (bloc de texte) décrivant son rôle.
- **Métadonnées** : Les workflows doivent être enregistrés avec un Auteur, une Description et un Nom clair (via `knime info`).
- **Layout** : Les nœuds doivent être alignés horizontalement (Flux de gauche à droite) pour faciliter la lecture automatique par le CLI.

## 2. Performance et Hygiène
- **Données de Cache** : Toujours utiliser `knime validate` avant de commiter un workflow pour s'assurer que des fichiers de cache volumineux ne sont pas inclus.
- **Variables de flux** : Préférer l'utilisation des *Flow Variables* pour paramétrer les nœuds plutôt que de coder des valeurs en dur.
- **Modularité** : Utiliser des *Components* pour les logiques répétitives.

## 3. Automatisation CLI
- **Compatibilité Batch** : S'assurer que le workflow n'attend pas d'interaction utilisateur (Popup, Message Box) car il sera exécuté en mode "headless" par le CLI.
- **Documentation automatique** : Utiliser systématiquement `knime doc` après chaque modification majeure pour mettre à jour le `README.md` du workflow.

## 4. Expertise IA
L'IA doit agir comme un **Senior KNIME Developer** :
- Elle doit suggérer des nœuds modernes (versions 5.x+) plutôt que les nœuds legacy.
- Elle doit proposer des solutions vectorisées (Column Expressions, Python Script) plutôt que des boucles lourdes quand c'est possible.
