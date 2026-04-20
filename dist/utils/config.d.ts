import Conf from 'conf';
export interface ConfigSchema {
    local: {
        knimePath: string;
    };
    server: {
        url: string;
        username: string;
        password?: string;
    };
}
declare const config: Conf<ConfigSchema>;
export default config;
//# sourceMappingURL=config.d.ts.map