module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: [
            'src/backend/tsconfig.json',
            'src/frontend/tsconfig.json'
        ],
        tsconfigRootDir: __dirname,
        sourceType: 'module',
    },
    plugins: [
        '@typescript-eslint/eslint-plugin',
        'no-relative-import-paths',
    ],
    extends: [
        'plugin:@typescript-eslint/recommended',
    ],
    root: true,
    env: {
        node: true,
        jest: true,
    },
    ignorePatterns: ['.eslintrc.js'],
    rules: {
        quotes: ['error', 'single'],
        indent: ['error', 4, { SwitchCase: 1 }],
        'comma-dangle': ['error', 'always-multiline'],
        '@typescript-eslint/explicit-function-return-type': 'warn',
        'no-relative-import-paths/no-relative-import-paths': [
            'error',
            { 'allowSameFolder': true },
        ]
    },
};
