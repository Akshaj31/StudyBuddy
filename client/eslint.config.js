import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import react from "eslint-plugin-react";
import unusedImports from "eslint-plugin-unused-imports";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
	globalIgnores(["dist"]),
	{
		files: ["**/*.{js,jsx}"],
		extends: [
			js.configs.recommended,
			react.configs.recommended,
			reactHooks.configs["recommended-latest"],
			reactRefresh.configs.vite,
		],
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.browser,
			parserOptions: {
				ecmaVersion: "latest",
				ecmaFeatures: { jsx: true },
				sourceType: "module",
			},
		},
		settings: {
			react: { version: "detect" },
		},
		rules: {
			// Prefer plugin for auto-removing imports
			"unused-imports/no-unused-imports": "error",
			"unused-imports/no-unused-vars": [
				"warn",
				{ varsIgnorePattern: "^[A-Z_]", argsIgnorePattern: "^_" },
			],
			"no-unused-vars": ["off"],
		},
		plugins: {
			react,
			"unused-imports": unusedImports,
		},
	},
]);
