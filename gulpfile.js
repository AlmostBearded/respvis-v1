// # Setup

const gulp = require('gulp');

// ## Rollup

const rollup = require('rollup');
const rollupCommonJs = require('@rollup/plugin-commonjs');
const rollupNodeResolve = require('@rollup/plugin-node-resolve').default;
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
    external: [
      'd3-selection',
      'd3-array',
      'd3-axis',
      'd3-brush',
      'd3-scale',
      'd3-transition',
      'd3-zoom',
    ],
    plugins: [rollupNodeResolve({ browser: true }), rollupCommonJs(), rollupTypescript()],
  });
  return bundle.write({
    file: `dist/respvis${minify ? '.min' : ''}.js`,
    format: 'iife',
    name: 'respVis',
    globals: {
      'd3-selection': 'd3',
      'd3-array': 'd3',
      'd3-axis': 'd3',
      'd3-brush': 'd3',
      'd3-scale': 'd3',
      'd3-transition': 'd3',
      'd3-zoom': 'd3',
    },
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

function copyHtmlFiles() {
  return gulp.src('./src/**/*.html').pipe(gulp.dest('./dist'));
}

function copyCssFiles() {
  return gulp.src('./src/**/*.css').pipe(gulp.dest('./dist'));
}

function copyExampleScripts() {
  return gulp.src('./src/examples/**/*.js').pipe(gulp.dest('./dist/examples'));
}

// ## Reload browser

function reloadBrowser(cb) {
  browserSync.reload();
  cb();
}

// ## Clean

function cleanDist() {
  return del('dist/**', { force: true });
}

function cleanNodeModules() {
  return del('node_modules/**', { force: true });
}

// # Public tasks

exports.clean = cleanDist;

exports.cleanAll = gulp.series([cleanDist, cleanNodeModules]);

exports.build = gulp.series([
  exports.clean,
  gulp.parallel([
    bundleJSLib,
    bundleJSLibMin,
    bundleJSLibMinZipped,
    copyHtmlFiles,
    copyCssFiles,
    copyExampleScripts,
  ]),
]);

exports.serve = function serve() {
  browserSync.init({
    server: './dist',
    startPath: '/',
  });

  gulp.watch('./src/**/*', { ignoreInitial: false }, gulp.series(exports.build, reloadBrowser));
};

exports.default = exports.serve;
