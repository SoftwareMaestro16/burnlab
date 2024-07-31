// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import { nodePolyfills } from 'vite-plugin-node-polyfills';
// import mkcert from 'vite-plugin-mkcert';

// export default defineConfig({
//   plugins: [
//     react(),
//     nodePolyfills({
//       include: ['buffer']
//     }),
//     mkcert() // Добавляем плагин для создания сертификатов
//   ],
//   server: {
//     host: '0.0.0.0', // Expose to all network interfaces
//     port: 5175,      // Default port; you can change if needed
//     open: true,      // Automatically open the browser
//     https: true,     // Включаем HTTPS
//     strictPort: true // Prevents the server from trying other ports if 5175 is in use
//   },
//   build: {
//     outDir: 'dist', // Directory for the build output
//     sourcemap: true, // Generate source maps for easier debugging
//     rollupOptions: {
//       output: {
//         // Customize output filenames
//         entryFileNames: 'assets/[name].js',
//         chunkFileNames: 'assets/[name].js',
//         assetFileNames: 'assets/[name].[ext]'
//       }
//     }
//   },
//   optimizeDeps: {
//     include: ['react', 'react-dom'] // Pre-bundle these dependencies for faster start
//   },
//   resolve: {
//     alias: {
//       // Add any necessary path aliases
//       '@': '/src',
//     }
//   }
// });

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import {nodePolyfills} from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
      react(),
    nodePolyfills({
      include: ['buffer']
    })
  ]
})
