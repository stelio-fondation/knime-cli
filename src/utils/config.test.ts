import config from './config';

describe('Config Utility', () => {
  beforeEach(() => {
    config.clear();
  });

  it('should set and get a local config value', () => {
    config.set('local.knimePath', '/test/path');
    expect(config.get('local.knimePath')).toBe('/test/path');
  });

  it('should set and get a server config value', () => {
    config.set('server.url', 'http://localhost:8080');
    expect(config.get('server.url')).toBe('http://localhost:8080');
  });

  it('should return undefined if not set', () => {
    expect(config.get('local.knimePath')).toBeUndefined();
  });

  it('should delete a config value', () => {
    config.set('local.knimePath', '/test/path');
    config.delete('local.knimePath' as any);
    expect(config.get('local.knimePath')).toBe('');
  });
});
