module.exports = {
  root: true,
  env: { browser: true, es2022: true },
  globals: { React: 'readonly' },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  plugins: ['react', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  settings: {
    react: { version: 'detect' },
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/no-unescaped-entities': 'off',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-unused-vars': 'off',
  },
  ignorePatterns: ['dist', 'build', 'node_modules'],
};
