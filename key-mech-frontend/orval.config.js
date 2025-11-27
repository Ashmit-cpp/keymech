module.exports = {
    keymech: {
      input: '../packages/api-schema/openapi.json',
      output: {
        target: './src/api/generated.ts',
        client: 'react-query',
        httpClient: 'fetch',
        clean: true,
        prettier: true,
      },
    },
  };
  