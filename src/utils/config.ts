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

const schema: any = {
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

const config = new Conf<ConfigSchema>({
  projectName: 'knime-cli',
  schema
});

export default config;
