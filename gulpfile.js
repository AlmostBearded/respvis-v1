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

async function bundleJS() {
  const bundle = await rollup.rollup({
    input: 'src/lib/index.ts',
    external: ['d3'],
    plugins: [rollupNodeResolve({ browser: true }), rollupCommonJs(), rollupTypescript()],
  });

  const minPlugins = [rollupTerser()];
  const gzPlugins = [rollupTerser(), rollupGzip()];
  const writeConfigurations = [
    { extension: 'js', format: 'iife', plugins: [] },
    { extension: 'min.js', format: 'iife', plugins: minPlugins },
    { extension: 'min.js', format: 'iife', plugins: gzPlugins },
    { extension: 'mjs', format: 'es', plugins: [] },
    { extension: 'min.mjs', format: 'es', plugins: minPlugins },
    { extension: 'min.mjs', format: 'es', plugins: gzPlugins },
  ];

  return Promise.all(
    writeConfigurations.map((c) =>
      bundle.write({
        file: `dist/respvis.${c.extension}`,
        format: c.format,
        name: 'respVis',
        globals: {
          d3: 'd3',
        },
        paths: {
          d3: 'https://cdn.skypack.dev/d3@7',
        },
        plugins: c.plugins,
        sourcemap: true,
      })
    )
  );
}

function bundleCSS() {
  return gulp.src('./src/respvis.css').pipe(gulp.dest('./dist'));
}

function copyExamples() {
  return gulp.parallel(
    gulp.src('./src/examples/**/*').pipe(gulp.dest('./dist/examples')),
    gulp.src('./src/index.html').pipe(gulp.dest('./dist'))
  );
}

function copyExamplesRedirect() {
  return gulp.src('./src/index.html').pipe(gulp.dest('./dist'));
}

// ## Reload browser

function reloadBrowser(cb) {
  browserSync.reload();
  cb();
}

// ## Clean

function cleanDist() {
  return del('dist', { force: true });
}

function cleanNodeModules() {
  return del('node_modules', { force: true });
}

// # Public tasks

exports.clean = cleanDist;

exports.cleanAll = gulp.series([cleanDist, cleanNodeModules]);

exports.build = gulp.series([exports.clean, gulp.parallel([bundleJS, bundleCSS, copyExamples, copyExamplesRedirect])]);

exports.serve = function serve() {
  browserSync.init({
    server: './dist',
    startPath: '/examples',
  });

  const watchOptions = { ignoreInitial: false };
  gulp.watch('./src/**/*.ts', watchOptions, gulp.series(bundleJS, reloadBrowser));
  gulp.watch('./src/respvis.css', watchOptions, gulp.series(bundleCSS, reloadBrowser));
  gulp.watch('./src/examples/**/*', watchOptions, gulp.series(copyExamples, copyExamplesRedirect, reloadBrowser));
};

exports.default = exports.serve;
