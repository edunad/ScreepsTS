module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
        },
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
    extends: ['plugin:react/recommended', 'plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
    rules: {
        'react/react-in-jsx-scope': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/explicit-member-accessibility': 'error',
        '@typescript-eslint/explicit-function-return-type': 'error',
        '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
        '@typescript-eslint/no-require-imports': 'error',
        '@typescript-eslint/typedef': [
            'error',
            {
                arrayDestructuring: true,
                arrowParameter: true,
                memberVariableDeclaration: true,
                parameter: true,
                objectDestructuring: true,
                propertyDeclaration: true,
                variableDeclaration: true,
            },
        ],
        '@typescript-eslint/no-inferrable-types': 'off',
    },
};
