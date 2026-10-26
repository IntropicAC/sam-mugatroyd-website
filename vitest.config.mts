import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      { find: /^@\//, replacement: `${root}/` },
      // Tests run outside React Server Components, where server-only throws.
      { find: /^server-only$/, replacement: `${root}/node_modules/server-only/empty.js` },
    ],
  },
  test: {
    // Process the SDK through Vite so Next's extensionless framework imports
    // resolve in Node tests as they do in the application bundler.
    server: { deps: { inline: ["@neondatabase/auth"] } },
    environment: "node",
    include: ["lib/**/*.test.{ts,tsx}"],
  },
});
