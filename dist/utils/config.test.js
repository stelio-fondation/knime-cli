"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("./config"));
describe('Config Utility', () => {
    beforeEach(() => {
        config_1.default.clear();
    });
    it('should set and get a local config value', () => {
        config_1.default.set('local.knimePath', '/test/path');
        expect(config_1.default.get('local.knimePath')).toBe('/test/path');
    });
    it('should set and get a server config value', () => {
        config_1.default.set('server.url', 'http://localhost:8080');
        expect(config_1.default.get('server.url')).toBe('http://localhost:8080');
    });
    it('should return undefined if not set', () => {
        expect(config_1.default.get('local.knimePath')).toBeUndefined();
    });
    it('should delete a config value', () => {
        config_1.default.set('local.knimePath', '/test/path');
        config_1.default.delete('local.knimePath');
        expect(config_1.default.get('local.knimePath')).toBe('');
    });
});
//# sourceMappingURL=config.test.js.map