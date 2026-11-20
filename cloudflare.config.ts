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
    // The custom domain (coachatriplethreat.com) is attached separately in the Cloudflare dashboard/API,
    // because the apex was previously served by a Pages project.
    domains: [],
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
