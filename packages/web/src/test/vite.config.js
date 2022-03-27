import {defineConfig} from 'vite';

export default defineConfig(async () => {
  return {
    root: 'src/test',
    server: {
      port: 3030,
    },
  };
});
