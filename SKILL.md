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
- `knime build -w <wf> --prompt <p>`: Create workflow from description.
- `knime create <wf>` / `knime add-node -w <wf> -t <type>`: Manual composition.
- `knime connect -w <wf> --from <id:p> --to <id:p>`: Link nodes.
- `knime lineage -w <wf>`: View data flow/connections.
- `knime live -w <wf>`: Pilot server & Dashboard (port 3030).
- `knime config set <key> <val>`: Configure `local.knimePath` or `server.url`.
- `knime run -w <wf> [--webhook <url>]`: Execute with notification.

**Useful Links**:
- [Official KNIME Documentation](https://docs.knime.com/)
- [KNIME Hub (Search Nodes & Workflows)](https://hub.knime.com/)
- [KNIME Node Reference Guide](https://docs.knime.com/latest/analytics_platform_node_guide/index.html)
- [KNIME Forum (Community Help)](https://forum.knime.com/)

## 🤖 AI-Native Workflow Composition
Agents can build workflows by manipulating the `.knwf` directory:
1. **Directory**: Create a folder `<name>`.
2. **Structure**: Each node is a sub-folder `Name (#ID)` containing `settings.xml`.
3. **Connections**: Defined in the root `workflow.knime` XML file.
4. **Metadata**: `workflow.knime` must contain `<config key="nodes">` and `<config key="connections">`.

**Repo**: https://github.com/stelio-fondation/knime-cli
