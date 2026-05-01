module.exports = {
  extends: ['@cebees/eslint-config'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  env: {
    node: true,
    es2022: true,
  },
};
