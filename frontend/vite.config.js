/**
 * Vite is our "Build Tool".
 * When we write React code, it's actually spread across dozens of files and uses
 * special syntax (JSX) that normal web browsers don't understand.
 * 
 * Vite is the engine that takes all our messy, human-readable code, squishes it together, 
 * translates it into standard JavaScript that browsers understand, and serves it lightning fast.
 */

// 1. Importing Vite Configuration Helpers
// ---------------------------------------------------------
import { defineConfig } from 'vite'

// 2. Importing the React Plugin
// ---------------------------------------------------------
// Vite can build Vue, Svelte, or plain JavaScript apps. 
// We import this specific plugin to tell Vite: "Hey, we are using React!"
import react from '@vitejs/plugin-react'

// 3. Exporting the Configuration
// ---------------------------------------------------------
// https://vite.dev/config/
export default defineConfig({
  // We register the React plugin so Vite knows how to process our .jsx files correctly.
  plugins: [react()],
  
  // NOTE: If we wanted to add more complex features later (like setting up a proxy 
  // so we don't have to deal with CORS during local development), we would add them right here!
})
