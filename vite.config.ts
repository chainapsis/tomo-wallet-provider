/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tsconfigPaths from 'vite-tsconfig-paths'
import { resolve } from 'path'
import { typescriptPaths } from 'rollup-plugin-typescript-paths'
import typescript from '@rollup/plugin-typescript'

// https://vitejs.dev/config https://vitest.dev/config
export default defineConfig({
  plugins: [/*wasm(), */ react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: 'happy-dom'
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      stream: 'stream-browserify'
    }
  },
  build: {
    minify: true,
    reportCompressedSize: true,
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      formats: ['es'],
      fileName: 'main'
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        '@bitcoinerlab/secp256k1',
        '@cosmjs/stargate',
        '@keystonehq/animated-qr',
        '@keystonehq/keystone-sdk',
        '@keystonehq/sdk',
        '@scure/bip32',
        'bitcoinjs-lib'
      ],
      plugins: [
        typescriptPaths({
          preserveExtensions: true
        }),
        typescript({
          sourceMap: false,
          declaration: true,
          outDir: 'dist'
        })
      ]
    }
  }
})
