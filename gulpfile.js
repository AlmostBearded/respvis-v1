// # Setup

const gulp = require('gulp');

// ## Rollup

const rollup = require('rollup');
const rollupCommonJs = require('@rollup/plugin-commonjs');
const rollupNodeResolve = require('@rollup/plugin-node-resolve');

// ## BrowserSync

const browserSync = require('browser-sync').create();

// ## Utilities

const del = require('del');

// # Private tasks

// ## Bundle JS

async function bundleJS() {
  const bundle = await rollup.rollup({
    input: 'src/index.js',
    plugins: [
      rollupCommonJs(),
      rollupNodeResolve()
    ],
  });
  return bundle.write({
    file: `dist/index.js`,
    format: 'iife',
    name: 'caseStudy',
    plugins: [],
    sourcemap: true,
  });
}

// ## Copy HTML files

function copyHTMLFiles() {
  return gulp.src('./src/**/*.html').pipe(gulp.dest('./dist'));
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

exports.build = gulp.series([exports.clean, gulp.parallel([bundleJS, copyHTMLFiles])]);

exports.serve = function serve() {
  browserSync.init({
    server: './dist',
  });

  gulp.watch('./src/**/*', { ignoreInitial: false }, gulp.series(exports.build, reloadBrowser));
};

exports.default = exports.serve;
