module.exports = {
  extends:
    "./node_modules/@krakenjs/grumbler-scripts/config/.eslintrc-typescript.js",

  globals: {
    __TEST__: true,
  },

  rules: {
    "no-mixed-operators": "off",
    // off for initial ts conversion
    "@typescript-eslint/no-implicit-any-catch": "off",
    "@typescript-eslint/no-unsafe-call": "off",
    "@typescript-eslint/no-unsafe-return": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-use-before-define": "off",
  },
};
