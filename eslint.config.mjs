import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // The Bible reader is ported from the standalone Lamp app. Its logic is kept as written there,
    // so the stricter React rules this project follows elsewhere are not applied to it.
    files: ["src/lib/bible/**"],
    rules: {
      "react/no-unescaped-entities": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/refs": "off",
      "react-hooks/exhaustive-deps": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Third party components, kept as shipped.
    "imported_components/**",
    "src/components/vendor/**",
  ]),
]);

export default eslintConfig;
