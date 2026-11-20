import { bindings, defineConfig, defineWorker } from "cf/config";
import { createWorkersResponseStoreSelfContainedConfig } from "@vinext/cloudflare/cache/config";

const cache = await createWorkersResponseStoreSelfContainedConfig({
  worker: "ca-website",
  bucket: "ca-website-response-store-cache-bodies",
});

export default defineConfig({
  worker: defineWorker({
    ...cache,
    name: "ca-website",
    entrypoint: "vinext/server/fetch-handler",
    compatibilityDate: "2026-11-20",
    // Served at this hostname (Worker Custom Domain). Hostname must have no DNS record of its own.
    domains: ["v3.coachatriplethreat.com"],
    assets: {
      htmlHandling: "none",
      notFoundHandling: "none",
      runWorkerFirst: ["/*", "!/_next/static/*", "!/*/_next/static/*"],
    },
    env: {
      ...cache.env,
      ASSETS: bindings.assets(),
      IMAGES: bindings.images(),
    },
  }),
});
