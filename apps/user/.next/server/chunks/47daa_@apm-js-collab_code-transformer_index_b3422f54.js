module.exports = {

"[project]/node_modules/.pnpm/@apm-js-collab+code-transformer@0.8.2/node_modules/@apm-js-collab/code-transformer/index.js [instrumentation] (ecmascript)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.create = create;
// ./pkg/orchestrion_js.js has a side effect of loading the wasm binary. 
// We only want that if the library is actually used!
var cachedCreate;
/**
 * Create a new instrumentation matcher from an array of instrumentation configs.
 */ function create(configs, dc_module) {
    if (!cachedCreate) {
        cachedCreate = __turbopack_context__.r("[project]/node_modules/.pnpm/@apm-js-collab+code-transformer@0.8.2/node_modules/@apm-js-collab/code-transformer/pkg/orchestrion_js.js [instrumentation] (ecmascript)").create;
    }
    if (cachedCreate === undefined) {
        throw new Error("Failed to load '@apm-js-collab/code-transformer'");
    }
    return cachedCreate(configs, dc_module);
}
}}),

};

//# sourceMappingURL=47daa_%40apm-js-collab_code-transformer_index_b3422f54.js.map