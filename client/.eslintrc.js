module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true
  },
  extends: [
    "airbnb",
    "prettier",
    "prettier/react",
  ],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly"
  },
  parser: "babel-eslint",
  rules: {
    strict: 0
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 6,
    sourceType: "module"
  },
  plugins: ["react", "prettier"],
  rules: {
    "prettier/prettier": "error"
  }
};
