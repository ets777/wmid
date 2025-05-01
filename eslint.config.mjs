import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths';


/** @type {import('eslint').Linter.Config[]} */
export default [
    { files: ['**/*.{js,mjs,cjs,ts}'] },
    { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    {
        rules: {
            quotes: ['error', 'single'],
            indent: ['error', 4, { SwitchCase: 1 }],
            'comma-dangle': ['error', 'always-multiline'],
            '@typescript-eslint/explicit-function-return-type': 'warn',
            'no-relative-import-paths/no-relative-import-paths': [
                'error',
                { 'allowSameFolder': true },
            ],
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    'args': 'all',
                    'argsIgnorePattern': '^_',
                    'caughtErrors': 'all',
                    'caughtErrorsIgnorePattern': '^_',
                    'destructuredArrayIgnorePattern': '^_',
                    'varsIgnorePattern': '^_',
                    'ignoreRestSiblings': true,
                },
            ],
        },
        plugins: {
            typescriptEslint,
            'no-relative-import-paths': noRelativeImportPaths,
        },
    },
];