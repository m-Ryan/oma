module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: [],
  extends: [
    'prettier',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  rules: {
     'no-multiple-empty-lines': ["error", { "max": 2, "maxEOF": 1 }]
  },
};
