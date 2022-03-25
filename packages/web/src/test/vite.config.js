import {defineConfig} from 'vite';
import {viteCommonjs} from '@originjs/vite-plugin-commonjs';

export default defineConfig(async () => {
  return {
    root: 'src/test',
    server: {
      port: 3030,
    },
    plugins: [viteCommonjs()],
  };
});
