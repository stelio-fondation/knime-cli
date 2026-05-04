#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const list_1 = require("./commands/list");
const run_1 = require("./commands/run");
const status_1 = require("./commands/status");
const stop_1 = require("./commands/stop");
const info_1 = require("./commands/info");
const validate_1 = require("./commands/validate");
const config_1 = require("./commands/config");
const doc_1 = require("./commands/doc");
const live_1 = require("./commands/live");
const diff_1 = require("./commands/diff");
const report_1 = require("./commands/report");
const install_skill_1 = require("./commands/install-skill");
const lineage_1 = require("./commands/lineage");
const create_1 = require("./commands/create");
const add_node_1 = require("./commands/add-node");
const connect_1 = require("./commands/connect");
const build_1 = require("./commands/build");
const program = new commander_1.Command();
program
    .name('knime')
    .description('CLI pour la gestion de workflows KNIME')
    .version('1.1.0');
// Force UTF-8 encoding for Windows compatibility
if (process.stdout.isTTY) {
    process.stdout.setDefaultEncoding?.('utf8');
}
program.addCommand(list_1.listCommand);
program.addCommand(run_1.runCommand);
program.addCommand(status_1.statusCommand);
program.addCommand(stop_1.stopCommand);
program.addCommand(info_1.infoCommand);
program.addCommand(validate_1.validateCommand);
program.addCommand(config_1.configCommand);
program.addCommand(doc_1.docCommand);
program.addCommand(live_1.liveCommand);
program.addCommand(diff_1.diffCommand);
program.addCommand(report_1.reportCommand);
program.addCommand(install_skill_1.installSkillCommand);
program.addCommand(lineage_1.lineageCommand);
program.addCommand(create_1.createCommand);
program.addCommand(add_node_1.addNodeCommand);
program.addCommand(connect_1.connectCommand);
program.addCommand(build_1.buildCommand);
program.parse(process.argv);
//# sourceMappingURL=index.js.map