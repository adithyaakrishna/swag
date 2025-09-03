import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Set base path for GitHub Pages deployment
  // If you're deploying to https://<USERNAME>.github.io/<REPO>/
  // Replace 'swag-wear-your-way' with your repository name
  const base = mode === 'production' ? '/swag/' : '/';
  
  return {
    base,
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
