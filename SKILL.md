---
name: knime-cli
description: CLI expert for KNIME workflows (run, validate, diff, doc, live).
---

# KNIME CLI Skill

**CRITICAL**: On Windows, NEVER use PowerShell. Use `cmd.exe` or `knime.cmd`. If EPERM occurs, use `.\knime-safe.bat [args]`.

## Core Commands
- `knime info -w <wf>`: View metadata & nodes (`--json` for raw data).
- `knime list -p <path>`: List workflows.
- `knime validate -w <wf>`: Check integrity, extensions, big files.
- `knime run -w <wf> [--server]`: Execute locally or via API.
- `knime status` / `knime stop --all`: Manage running instances.
- `knime doc -w <wf>`: Generate Markdown + Mermaid diagram.
- `knime report -w <wf>`: Detailed markdown report.
- `knime diff --w1 <wf1> --w2 <wf2>`: Structural diff.
- `knime lineage -w <wf>`: View data flow/connections.
- `knime live -w <wf>`: Pilot server & Dashboard (port 3030).
- `knime config set <key> <val>`: Configure `local.knimePath` or `server.url`.
- `knime run -w <wf> [--webhook <url>]`: Execute with notification.

**Full Docs & Repo**: https://github.com/stelio-fondation/knime-cli
