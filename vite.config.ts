import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 4260,
    host: true,
    watch: {
      usePolling: true,
    },
  },
});
