module.exports = {
    env: {
        es6: true,
        node: true,
        jest: true,
    },
    extends: [
        'airbnb-base',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
        'prettier', // needs to be last?
    ],
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
    },
    overrides: [
        {
            files: ['test/**'],
            rules: {
                'class-methods-use-this': 'off',
            },
        },
    ],
    plugins: ['@typescript-eslint', 'prettier'],
    rules: {
        'no-shadow': 'off',
        '@typescript-eslint/no-shadow': 'error',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        'no-underscore-dangle': 'off',
        'no-use-before-define': 'off',
        'class-methods-use-this': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        // related to NGRX
        'max-classes-per-file': 'off', // TODO (remove) in ADAPI-4290
        'no-case-declarations': 'off', // TODO (remove) in ADAPI-4290
        'linebreak-style': [0, 'error', 'windows'],
        'no-console': 'off',
        'no-param-reassign': ['error', { props: false }],
        'prettier/prettier': [
            'error',
            { singleQuote: true },
        ],
        'import/prefer-default-export': 'off',
        'no-useless-constructor': 'off',
        'import/extensions': [
            'error',
            'ignorePackages',
            {
                js: 'never',
                jsx: 'never',
                ts: 'never',
                tsx: 'never',
            },
        ],
    },
    settings: {
        'import/resolver': {
            node: {
                extensions: ['.js', '.jsx', '.ts', '.tsx'],
            },
            typescript: {},
        },
    },
};
