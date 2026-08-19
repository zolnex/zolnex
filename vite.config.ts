import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ---------------------------------------------------------------------------
// GitHub Pages optimization
// ---------------------------------------------------------------------------
// GitHub Pages serves static files with no server-side routing. To make the
// SPA work no matter WHERE it is deployed (project page like
// https://user.github.io/repo/, a user/org page, or a custom domain) we use a
// RELATIVE base (`'./'`). Every emitted asset URL is then resolved relative to
// index.html, so the build is fully portable and there is no hardcoded path.
//
// Client-side routing uses HashRouter (see src/main.tsx) so deep links survive
// a hard refresh on GitHub Pages without needing a 404.html fallback hack.
// ---------------------------------------------------------------------------
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Split vendor chunks for better caching on a CDN-backed static host.
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          jszip: ['jszip'],
        },
      },
    },
  },
  server: {
    host: true,
    port: 5173,
    // Allow the dynamic preview hostnames used by the live preview.
    allowedHosts: true,
  },
  preview: {
    host: true,
    port: 4173,
  },
})
