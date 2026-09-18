import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// RankPulse is designed for GitHub Pages and other static hosts. Relative asset
// paths keep it portable across a custom domain and project-page deployments;
// HashRouter handles dashboard deep links without a host rewrite rule.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rolldownOptions: {
      output: {
        // Vite 8 / Rolldown replacement for Rollup's former manualChunks.
        // Stable framework and visualization chunks improve cache reuse.
        codeSplitting: {
          groups: [
            { name: 'framework', test: /node_modules[\\/](?:react|react-dom|react-router|react-router-dom|scheduler)[\\/]/ },
            { name: 'charts', test: /node_modules[\\/](?:recharts|victory-vendor|@reduxjs|react-redux|reselect|immer|es-toolkit|decimal\.js-light|eventemitter3|tiny-invariant|use-sync-external-store)[\\/]/ },
            { name: 'icons', test: /node_modules[\\/]lucide-react[\\/]/ },
          ],
        },
      },
    },
  },
  server: {
    host: true,
    port: 5173,
    allowedHosts: true,
  },
  preview: {
    host: true,
    port: 4173,
  },
})
