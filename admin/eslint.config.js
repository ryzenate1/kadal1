import { Linter } from "eslint";

/** @type {Linter.Config} */
const config = {
  parser: "@typescript-eslint/parser",
  rules: {
    "@typescript-eslint/no-unused-vars": "warn"
  }
};

export default config;
