import js from '@eslint/js';
import nextPlugin from '@next/eslint-plugin-next';
import reactPlugin from 'eslint-plugin-react';
import hooksPlugin from 'eslint-plugin-react-hooks';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import globals from 'globals';

export default [
	{
		ignores: ['.next/*'],
	},
	js.configs.recommended,
	{
		files: ['**/*.{js,jsx,ts,tsx}'],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
				ecmaFeatures: {
					jsx: true,
				},
			},
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
		plugins: {
			'@next/next': nextPlugin,
			react: reactPlugin,
			'react-hooks': hooksPlugin,
			'@typescript-eslint': tsPlugin,
		},
		rules: {
			...reactPlugin.configs.recommended.rules,
			...hooksPlugin.configs.recommended.rules,
			...nextPlugin.configs.recommended.rules,
			...nextPlugin.configs['core-web-vitals'].rules,

			'quotes': ['error', 'single'],
			'no-mixed-spaces-and-tabs': 'warn',
			'react/no-unescaped-entities': [
				'error',
				{
					forbid: ['>', '}'],
				},
			],
			'no-use-before-define': [
				'error',
				{
					functions: true,
					classes: true,
					variables: true,
					allowNamedExports: false,
				},
			],
			'@typescript-eslint/no-unused-vars': 'error',
			'@typescript-eslint/no-explicit-any': 'off',
			'no-unused-vars': 'off', // Handled by typescript-eslint
			'react/prop-types': 'off', // Not needed with TypeScript
			'react/react-in-jsx-scope': 'off',
			'react/no-unknown-property': 'off',
		},
		settings: {
			react: {
				version: 'detect',
			},
			next: {
				rootDir: './src/',
			},
		},
	},
];
