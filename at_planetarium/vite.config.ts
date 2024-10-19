import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      'three': 'three',
      'three/examples/jsm/controls/OrbitControls': 'three/examples/jsm/controls/OrbitControls.js',
    },
  },
})