import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import jsxA11y from 'eslint-plugin-jsx-a11y';
import eslintPluginImport from 'eslint-plugin-import';

export default tseslint.config(
  { ignores: ["dist"] },
  // Config for .ts, .tsx files (React components, app logic, etc.)
  {
    files: ["src/**/*.{ts,tsx}"], // More specific to src
    extends: [
        js.configs.recommended,
        ...tseslint.configs.recommended,
        jsxA11y.flatConfigs.recommended,
        // eslintPluginImport.configs.recommended, // Removed from extends
        // eslintPluginImport.configs.typescript, // Removed from extends
    ],
    languageOptions: {
      ecmaVersion: "latest",
      globals: globals.browser,
      parserOptions: {
        project: "./tsconfig.app.json", // Specifically for app files
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "import": eslintPluginImport,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...(eslintPluginImport.configs.recommended?.rules || {}),
      ...(eslintPluginImport.configs.typescript?.rules || {}), // Spreading rules, ensure this structure is correct
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": "warn",
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.app.json", // Match to this config block's project
        },
        node: true,
      },
    },
  },
  // Config for root-level config files (vite.config.ts, tailwind.config.ts)
  {
    files: ["tailwind.config.ts", "vite.config.ts"], // Specific files
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
    ],
    languageOptions: {
      ecmaVersion: "latest",
      globals: { ...globals.node, process: 'readonly', __dirname: 'readonly' }, // Node globals
      parserOptions: {
        project: "./tsconfig.node.json", // Specifically for node/config files
      },
    },
    plugins: {
      "import": eslintPluginImport,
    },
    rules: {
      ...(eslintPluginImport.configs.recommended?.rules || {}),
      ...(eslintPluginImport.configs.typescript?.rules || {}),
      "@typescript-eslint/no-unused-vars": "warn",
      // Example: Allow default exports for config files if needed
      // "import/no-default-export": "off",
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.node.json", // Match to this config block's project
        },
        node: true,
      },
    },
  }
);
