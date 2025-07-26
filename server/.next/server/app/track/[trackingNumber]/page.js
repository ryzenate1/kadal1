const CHUNK_PUBLIC_PATH = "server/app/track/[trackingNumber]/page.js";
const runtime = require("../../../chunks/ssr/[turbopack]_runtime.js");
runtime.loadChunk("server/chunks/ssr/08b5e_487a2e._.js");
runtime.loadChunk("server/chunks/ssr/[project]_client_f71adf._.js");
runtime.getOrInstantiateRuntimeModule("[project]/client/.next-internal/server/app/track/[trackingNumber]/page/actions.js [app-rsc] (ecmascript)", CHUNK_PUBLIC_PATH);
module.exports = runtime.getOrInstantiateRuntimeModule("[project]/node_modules/next/dist/esm/build/templates/app-page.js?page=/track/[trackingNumber]/page { COMPONENT_0 => \"[project]/client/src/app/layout.tsx [app-rsc] (ecmascript, Next.js server component)\", COMPONENT_1 => \"[project]/node_modules/next/dist/client/components/not-found-error.js [app-rsc] (ecmascript, Next.js server component)\", COMPONENT_2 => \"[project]/client/src/app/track/[trackingNumber]/page.tsx [app-rsc] (ecmascript, Next.js server component)\" } [app-rsc] (ecmascript) <facade>", CHUNK_PUBLIC_PATH).exports;
