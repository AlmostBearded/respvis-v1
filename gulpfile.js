// # Setup

const gulp = require('gulp');

// ## Rollup

const rollup = require('rollup');
const rollupCommonJs = require('@rollup/plugin-commonjs');
const rollupNodeResolve = require('@rollup/plugin-node-resolve');
const rollupTypescript = require('@rollup/plugin-typescript');
const rollupTerser = require('rollup-plugin-terser').terser;
const rollupGzip = require('rollup-plugin-gzip').default;

// ## BrowserSync

const browserSync = require('browser-sync').create();

// ## Utilities

const del = require('del');
const rename = require('gulp-rename');
const path = require('path');

// # Private tasks

// ## Bundle JS

async function bundleJSLibWithSettings(minify, zip) {
  const outputPlugins = [];
  if (minify) {
    outputPlugins.push(rollupTerser());
    if (zip) {
      outputPlugins.push(rollupGzip());
    }
  }

  const bundle = await rollup.rollup({
    input: 'src/lib/index.ts',
    plugins: [rollupNodeResolve({ browser: true }), rollupCommonJs(), rollupTypescript()],
  });
  return bundle.write({
    file: `dist/respvis${minify ? '.min' : ''}.js`,
    format: 'iife',
    name: 'respVis',
    plugins: outputPlugins,
    sourcemap: true,
  });
}

async function bundleJSLib() {
  return bundleJSLibWithSettings(false, false);
}

async function bundleJSLibMin() {
  return bundleJSLibWithSettings(true, false);
}

async function bundleJSLibMinZipped() {
  return bundleJSLibWithSettings(true, true);
}

// ## Copy HTML files

function copyHTMLFiles() {
  return gulp.src('./src/**/*.html').pipe(gulp.dest('./dist'));
}

function copyExampleScripts() {
  return gulp.src('./src/examples/**/*.js').pipe(gulp.dest('./dist/examples'));
}

// ## Reload browser

function reloadBrowser(cb) {
  browserSync.reload();
  cb();
}

// # Public tasks

exports.clean = function clean() {
  return del('dist/**', { force: true });
};

exports.build = gulp.series([
  exports.clean,
  gulp.parallel([bundleJSLib, /*bundleJSLibMin, bundleJSLibMinZipped,*/ copyHTMLFiles, copyExampleScripts]),
]);

exports.serve = function serve() {
  browserSync.init({
    server: './dist',
    startPath: '/',
  });

  gulp.watch('./src/**/*', { ignoreInitial: false }, gulp.series(exports.build, reloadBrowser));
};

exports.default = exports.serve;
