
var gulp = require('gulp');
var eslint = require('gulp-eslint');
var webpack = require('webpack');
var gulpWebpack = require('gulp-webpack');
var Server = require('karma').Server;
var argv = require('yargs').argv;

gulp.task('test', ['lint', 'karma']);
gulp.task('build', ['test', 'webpack', 'webpack-min']);

var FILE_NAME = 'beaver-logger';
var MODULE_NAME = '$logger';

var WEBPACK_CONFIG = {
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        query: {
          presets: ['es2015'],
          plugins: [
            'transform-flow-strip-types',
            'transform-object-rest-spread',
            'syntax-object-rest-spread',
            'transform-es3-property-literals',
            'transform-es3-member-expression-literals',
            ['transform-es2015-for-of', {loose: true}]
          ]
        }
      }
    ]
  },
  output: {
    filename: `${FILE_NAME}.js`,
    libraryTarget: 'umd',
    umdNamedDefine: true,
    library: MODULE_NAME
  },
  bail: true
};

var WEBPACK_CONFIG_MIN = Object.assign({}, WEBPACK_CONFIG, {
  output: {
    filename: `${FILE_NAME}.min.js`,
    libraryTarget: 'umd',
    umdNamedDefine: true,
    library: MODULE_NAME
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      minimize: true
    })
  ]
});


var ESLINT_CONFIG = {

  "env": {
    "browser": false,
    "node": true,
    "amd": true,
    "mocha": true,
    "es6": true
  },

  "parserOptions": {
    "sourceType": "module"
  },

  "globals": {
    "window": true,
    "document": true,
    "Promise": false,
    "performance": true
  },

  "fix": true,

  "rules": {
    // possible errors
    "comma-dangle": 2,
    "no-cond-assign": 2,
    "no-console": 0,
    "no-constant-condition": 0,
    "no-control-regex": 2,
    "no-debugger": 2,
    "no-dupe-args": 0,
    "no-dupe-keys": 2,
    "no-duplicate-case": 0,
    "no-empty-character-class": 2,
    "no-empty": 2,
    "no-ex-assign": 2,
    "no-extra-boolean-cast": 2,
    "no-extra-parens": 0,
    "no-extra-semi": 2,
    "no-func-assign": 2,
    "no-inner-declarations": [2, "functions"],
    "no-invalid-regexp": 2,
    "no-irregular-whitespace": 0,
    "no-negated-in-lhs": 2,
    "no-obj-calls": 2,
    "no-regex-spaces": 2,
    "no-sparse-arrays": 2,
    "no-unexpected-multiline": 0,
    "no-unreachable": 2,
    "quote-props": 2,
    "use-isnan": 2,
    "valid-jsdoc": 0,
    "valid-typeof": 2,

    // best practices
    "accessor-pairs": 0,
    "array-callback-return": 2,
    "block-scoped-var": 2,
    "complexity": [0, 10], // would love to turn this on someday
    "consistent-return": 0,
    "curly": [2, "all"],
    "default-case": 2,
    "dot-location": 0,
    "dot-notation": 2,
    "eqeqeq": 2,
    "guard-for-in": 0,
    "no-alert": 2,
    "no-caller": 2,
    "no-case-declarations": 0,
    "no-div-regex": 2,
    "no-else-return": 0,
    "no-empty-function": 1,
    "no-empty-pattern": 0,
    "no-eq-null": 2,
    "no-eval": 2,
    "no-extend-native": 2,
    "no-extra-bind": 2,
    "no-extra-label": 2,
    "no-fallthrough": 2,
    "no-floating-decimal": 2,
    "no-implicit-coercion": 0,
    "no-implicit-globals": 2,
    "no-implied-eval": 2,
    "no-invalid-this": 0,
    "no-iterator": 2,
    "no-labels": 2,
    "no-lone-blocks": 2,
    "no-loop-func": 2,
    "no-magic-numbers": 0,
    "no-multi-spaces": 2,
    "no-multi-str": 2,
    "no-native-reassign": 2,
    "no-new-func": 2,
    "no-new-wrappers": 2,
    "no-new": 2,
    "no-octal-escape": 2,
    "no-octal": 2,
    "no-param-reassign": 0,
    "no-process-env": 0,
    "no-proto": 2,
    "no-redeclare": 2,
    "no-return-assign": 2,
    "no-script-url": 2,
    "no-self-assign": 2,
    "no-self-compare": 2,
    "no-sequences": 2,
    "no-throw-literal": 2,
    "no-unmodified-loop-condition": 2,
    "no-unused-expressions": 2,
    "no-unused-labels": 2,
    "no-useless-call": 0,
    "no-useless-concat": 0,
    "no-void": 2,
    "no-warning-comments": 0,
    "no-with": 2,
    "radix": 2,
    "vars-on-top": 0,
    "wrap-iife": 2,
    "yoda": 2,

    // strict
    "strict": [2, "global"],

    // variables
    "init-declarations": 0,
    "no-catch-shadow": 2,
    "no-delete-var": 2,
    "no-label-var": 2,
    "no-restricted-globals": 0,
    "no-shadow-restricted-names": 2,
    "no-shadow": 2,
    "no-undef-init": 2,
    "no-undef": 2,
    "no-undefined": 0,
    "no-unused-vars": [2, {"vars": "all", "args": "none"}],
    "no-use-before-define": 1,

    // node.js
    "callback-return": 0,
    "global-require": 0,
    "handle-callback-err": 2,
    "no-mixed-requires": 2,
    "no-new-require": 2,
    "no-path-concat": 2,
    "no-process-env": 0,
    "no-process-exit": 2,
    "no-restricted-modules": 0,
    "no-sync": 0,

    // stylistic issues
    "array-bracket-spacing": 0,
    "block-spacing": 0,
    "brace-style": 0,
    "camelcase": 0,
    "comma-spacing": [2, {"before": false, "after": true}],
    "comma-style": [1, "last"],
    "computed-property-spacing": 0,
    "consistent-this": [2, "self"],
    "eol-last": 0,
    "func-names": 0,
    "func-style": [0, "declaration"],
    "id-blacklist": 0,
    "id-length": 0,
    "id-match": 0,
    "indent": [2, 4, {"SwitchCase": 1}],
    "jsx-quotes": 0,
    "key-spacing": 0,
    "keyword-spacing": 2,
    "linebreak-style": 0,
    "lines-around-comment": 0,
    "max-depth": [0, 4],
    "max-len": [0, 80, 4],
    "max-nested-callbacks": [0, 2],
    "max-params": [1, 5],
    "max-statements": [1, 30],
    "new-cap": 2,
    "new-parens": 2,
    "newline-after-var": 0,
    "newline-before-return": 0,
    "newline-per-chained-call": 0,
    "no-array-constructor": 2,
    "no-bitwise": 2,
    "no-continue": 0,
    "no-inline-comments": 0,
    "no-lonely-if": 2,
    "no-mixed-spaces-and-tabs": [2, true],
    "no-multiple-empty-lines": 0,
    "no-negated-condition": 0,
    "no-nested-ternary": 2,
    "no-new-object": 2,
    "no-plusplus": 0,
    "no-restricted-syntax": 0,
    "no-spaced-func": 2,
    "no-ternary": 0,
    "no-trailing-spaces": 0,
    "no-underscore-dangle": 0,
    "no-unneeded-ternary": 0,
    "no-whitespace-before-property": 2,
    "object-curly-spacing": 0,
    "one-var": 0,
    "one-var-declaration-per-line": [1, "always"],
    "operator-assignment": 0,
    "operator-linebreak": 0,
    "padded-blocks": 0,
    "quote-props": 0,
    "quotes": [2, "single"],
    "require-jsdoc": 0,
    "semi-spacing": 2,
    "semi": 2,
    "sort-imports": 0,
    "sort-vars": 0,
    "space-before-blocks": [2, "always"],
    "space-before-function-paren": 0,
    "space-in-parens": 2,
    "space-infix-ops": 2,
    "space-unary-ops": [2, { "words": true, "nonwords": false }],
    "spaced-comment": 2,
    "wrap-regex": 2
  }

};

var ESLINT_CONFIG_ES6 = {

  "parser": "babel-eslint",

  "env": {
    "browser": false,
    "node": true,
    "amd": true,
    "mocha": true,
    "es6": true
  },

  "ecmaFeatures": {
    "modules": true
  },

  "parserOptions": {
    "sourceType": "module"
  },

  "globals": {
    "window": true,
    "document": true,
    "Promise": false,
    "performance": true
  },

  "fix": true,

  "rules": {
    // possible errors
    "comma-dangle": 2,
    "no-cond-assign": 2,
    "no-console": 0,
    "no-constant-condition": 0,
    "no-control-regex": 2,
    "no-debugger": 2,
    "no-dupe-args": 0,
    "no-dupe-keys": 2,
    "no-duplicate-case": 0,
    "no-empty-character-class": 2,
    "no-empty": 2,
    "no-ex-assign": 2,
    "no-extra-boolean-cast": 2,
    "no-extra-parens": 0,
    "no-extra-semi": 2,
    "no-func-assign": 2,
    "no-inner-declarations": [2, "functions"],
    "no-invalid-regexp": 2,
    "no-irregular-whitespace": 0,
    "no-negated-in-lhs": 2,
    "no-obj-calls": 2,
    "no-regex-spaces": 2,
    "no-sparse-arrays": 2,
    "no-unexpected-multiline": 0,
    "no-unreachable": 2,
    "quote-props": 2,
    "use-isnan": 2,
    "valid-jsdoc": 0,
    "valid-typeof": 2,

    // best practices
    "accessor-pairs": 0,
    "array-callback-return": 2,
    "block-scoped-var": 2,
    "complexity": [0, 10], // would love to turn this on someday
    "consistent-return": 0,
    "curly": [2, "all"],
    "default-case": 2,
    "dot-location": 0,
    "dot-notation": 2,
    "eqeqeq": 2,
    "guard-for-in": 0,
    "no-alert": 2,
    "no-caller": 2,
    "no-case-declarations": 0,
    "no-div-regex": 2,
    "no-else-return": 0,
    "no-empty-function": 1,
    "no-empty-pattern": 0,
    "no-eq-null": 2,
    "no-eval": 2,
    "no-extend-native": 2,
    "no-extra-bind": 2,
    "no-extra-label": 2,
    "no-fallthrough": 2,
    "no-floating-decimal": 2,
    "no-implicit-coercion": 0,
    "no-implicit-globals": 2,
    "no-implied-eval": 2,
    "no-invalid-this": 0,
    "no-iterator": 2,
    "no-labels": 2,
    "no-lone-blocks": 2,
    "no-loop-func": 2,
    "no-magic-numbers": 0,
    "no-multi-spaces": 2,
    "no-multi-str": 2,
    "no-native-reassign": 2,
    "no-new-func": 2,
    "no-new-wrappers": 2,
    "no-new": 2,
    "no-octal-escape": 2,
    "no-octal": 2,
    "no-param-reassign": 0,
    "no-process-env": 0,
    "no-proto": 2,
    "no-redeclare": 2,
    "no-return-assign": 2,
    "no-script-url": 2,
    "no-self-assign": 2,
    "no-self-compare": 2,
    "no-sequences": 2,
    "no-throw-literal": 2,
    "no-unmodified-loop-condition": 2,
    "no-unused-expressions": 2,
    "no-unused-labels": 2,
    "no-useless-call": 0,
    "no-useless-concat": 0,
    "no-void": 2,
    "no-warning-comments": 0,
    "no-with": 2,
    "radix": 2,
    "vars-on-top": 0,
    "wrap-iife": 2,
    "yoda": 2,

    // strict
    "strict": [2, "global"],

    // variables
    "init-declarations": 0,
    "no-catch-shadow": 2,
    "no-delete-var": 2,
    "no-label-var": 2,
    "no-restricted-globals": 0,
    "no-shadow-restricted-names": 2,
    "no-shadow": 2,
    "no-undef-init": 2,
    "no-undef": 2,
    "no-undefined": 0,
    "no-unused-vars": [2, {"vars": "all", "args": "none"}],
    "no-use-before-define": 1,

    // node.js
    "callback-return": 0,
    "global-require": 0,
    "handle-callback-err": 2,
    "no-mixed-requires": 2,
    "no-new-require": 2,
    "no-path-concat": 2,
    "no-process-env": 0,
    "no-process-exit": 2,
    "no-restricted-modules": 0,
    "no-sync": 0,

    // stylistic issues
    "array-bracket-spacing": 0,
    "block-spacing": 0,
    "brace-style": 0,
    "camelcase": 0,
    "comma-spacing": [2, {"before": false, "after": true}],
    "comma-style": [1, "last"],
    "computed-property-spacing": 0,
    "consistent-this": [2, "self"],
    "eol-last": 0,
    "func-names": 0,
    "func-style": [0, "declaration"],
    "id-blacklist": 0,
    "id-length": 0,
    "id-match": 0,
    "indent": [2, 4, {"SwitchCase": 1}],
    "jsx-quotes": 0,
    "key-spacing": 0,
    "keyword-spacing": 2,
    "linebreak-style": 0,
    "lines-around-comment": 0,
    "max-depth": [0, 4],
    "max-len": [0, 80, 4],
    "max-nested-callbacks": [0, 2],
    "max-params": [1, 5],
    "max-statements": [1, 30],
    "new-cap": 2,
    "new-parens": 2,
    "newline-after-var": 0,
    "newline-before-return": 0,
    "newline-per-chained-call": 0,
    "no-array-constructor": 2,
    "no-bitwise": 2,
    "no-continue": 0,
    "no-inline-comments": 0,
    "no-lonely-if": 2,
    "no-mixed-spaces-and-tabs": [2, true],
    "no-multiple-empty-lines": 0,
    "no-negated-condition": 0,
    "no-nested-ternary": 2,
    "no-new-object": 2,
    "no-plusplus": 0,
    "no-restricted-syntax": 0,
    "no-spaced-func": 2,
    "no-ternary": 0,
    "no-trailing-spaces": 0,
    "no-underscore-dangle": 0,
    "no-unneeded-ternary": 0,
    "no-whitespace-before-property": 2,
    "object-curly-spacing": 0,
    "one-var": 0,
    "one-var-declaration-per-line": [1, "always"],
    "operator-assignment": 0,
    "operator-linebreak": 0,
    "padded-blocks": 0,
    "quote-props": 0,
    "quotes": [2, "single"],
    "require-jsdoc": 0,
    "semi-spacing": 2,
    "semi": 2,
    "sort-imports": 0,
    "sort-vars": 0,
    "space-before-blocks": [2, "always"],
    "space-before-function-paren": 0,
    "space-in-parens": 2,
    "space-infix-ops": 2,
    "space-unary-ops": [2, { "words": true, "nonwords": false }],
    "spaced-comment": 2,
    "wrap-regex": 2,

    // ES6

    // require braces in arrow function body
    "arrow-body-style": 0,
    // require parens in arrow function arguments
    "arrow-parens": 0,
    // require space before/after arrow function's arrow
    "arrow-spacing": 2,
    // verify super() callings in constructors
    "constructor-super": 2,
    // enforce the spacing around the * in generator functions
    "generator-star-spacing": 0,
    // disallow modifying variables of class declarations
    "no-class-assign": 2,
    "no-confusing-arrow": 2,
    // disallow modifying variables that are declared using const
    "no-const-assign": 2,
    // disallow duplicate name in class members
    "no-dupe-class-members": 2,
    "no-new-symbol": 2,
    "no-restricted-imports": 0,
    // disallow to use this/super before super() calling in constructors.
    "no-this-before-super": 2,
    "no-useless-constructor": 2,
    // require let or const instead of var
    "no-var": 1,
    // require method and property shorthand syntax for object literals
    "object-shorthand": 1,
    // suggest using arrow functions as callbacks
    "prefer-arrow-callback": 1,
    // suggest using of const declaration for variables that are never modified after declared
    "prefer-const": 0,
    "prefer-rest-params": 0,
    // suggest using Reflect methods where applicable
    "prefer-reflect": 0,
    // suggest using the spread operator instead of .apply()
    "prefer-spread": 0,
    // suggest using template literals instead of strings concatenation
    "prefer-template": 2,
    // disallow generator functions that do not have yield
    "require-yield": 2,
    "template-curly-spacing": 0,
    "yield-star-spacing": 0
  }

};


gulp.task('webpack', ['lint'], function() {
  return gulp.src('client/index.js')
      .pipe(gulpWebpack(WEBPACK_CONFIG))
      .pipe(gulp.dest('dist'));
});

gulp.task('webpack-min', ['lint'], function() {
  return gulp.src('client/index.js')
      .pipe(gulpWebpack(WEBPACK_CONFIG_MIN))
      .pipe(gulp.dest('dist'));
});

gulp.task('lint', ['lint:client', 'lint:server']);

gulp.task('lint:client', function() {
  return gulp.src(['client/**']).pipe(eslint(ESLINT_CONFIG_ES6))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('lint:server', function() {
  return gulp.src(['server/**']).pipe(eslint(ESLINT_CONFIG))
      .pipe(eslint.format())
      .pipe(eslint.failAfterError());
});

gulp.task('karma', function (done) {

  var server = new Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: !Boolean(argv['keep-browser-open']),
    client: {
      captureConsole: Boolean(argv['capture-console'])
    }
  });

  server.on('browser_error', function (browser, err) {
    console.log('Karma Run Failed: ' + err.message);
    throw err;
  });

  server.on('run_complete', function (browsers, results) {
    if (results.failed) {
      return done(new Error('Karma: Tests Failed'));
    }
    done();
  });

  server.start();
});
