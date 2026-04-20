"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const conf_1 = __importDefault(require("conf"));
const schema = {
    local: {
        type: 'object',
        properties: {
            knimePath: { type: 'string', default: '' }
        }
    },
    server: {
        type: 'object',
        properties: {
            url: { type: 'string', default: '' },
            username: { type: 'string', default: '' },
            password: { type: 'string', default: '' }
        }
    }
};
const config = new conf_1.default({
    projectName: 'knime-cli',
    schema
});
exports.default = config;
//# sourceMappingURL=config.js.map