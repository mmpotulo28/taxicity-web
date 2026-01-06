module.exports = {

"[project]/node_modules/.pnpm/@opentelemetry+resources@2.2.0_@opentelemetry+api@1.9.0/node_modules/@opentelemetry/resources/build/esm/detectors/platform/node/machine-id/getMachineId-linux.js [instrumentation] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ __turbopack_context__.s({
    "getMachineId": (()=>getMachineId)
});
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$next$2f$dist$2f$compiled$2f40$opentelemetry$2f$api__$5b$external$5d$__$28$next$2f$dist$2f$compiled$2f40$opentelemetry$2f$api$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)");
;
;
async function getMachineId() {
    const paths = [
        '/etc/machine-id',
        '/var/lib/dbus/machine-id'
    ];
    for (const path of paths){
        try {
            const result = await __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["promises"].readFile(path, {
                encoding: 'utf8'
            });
            return result.trim();
        } catch (e) {
            __TURBOPACK__imported__module__$5b$externals$5d2f$next$2f$dist$2f$compiled$2f40$opentelemetry$2f$api__$5b$external$5d$__$28$next$2f$dist$2f$compiled$2f40$opentelemetry$2f$api$2c$__cjs$29$__["diag"].debug(`error reading machine id: ${e}`);
        }
    }
    return undefined;
} //# sourceMappingURL=getMachineId-linux.js.map
}}),

};

//# sourceMappingURL=52bc5_build_esm_detectors_platform_node_machine-id_getMachineId-linux_6d83f121.js.map