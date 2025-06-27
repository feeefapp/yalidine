import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: false, // We'll use tsc for declarations
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false,
  target: 'es2020',
  outDir: 'build',
})
