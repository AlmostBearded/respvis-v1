// # Setup

const gulp = require('gulp');

// ## Rollup

const rollup = require('rollup');
const rollupCommonJs = require('@rollup/plugin-commonjs');
const rollupNodeResolve = require('@rollup/plugin-node-resolve');
const rollupTypescript = require('@rollup/plugin-typescript');
const rollupTerser = require('rollup-plugin-terser').terser;
const rollupGzip = require('rollup-plugin-gzip').default;

// ## Sass

const gulpSass = require('gulp-sass');
const nodeSass = require('node-sass');
gulpSass.compiler = nodeSass;

// ## BrowserSync

const browserSync = require('browser-sync').create();

// ## Utilities

const del = require('del');
const rename = require('gulp-rename');

// # Private tasks

// ## Compile sass files

function compileSass() {
  return gulp
    .src('./src/lib/index.scss')
    .pipe(gulpSass().on('error', gulpSass.logError))
    .pipe(rename('respvis.css'))
    .pipe(gulp.dest('./dist'));
}

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
    plugins: [rollupCommonJs(), rollupNodeResolve(), rollupTypescript()],
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
  gulp.parallel([
    compileSass,
    bundleJSLib,
    /*bundleJSLibMin, bundleJSLibMinZipped,*/ copyHTMLFiles,
  ]),
]);

exports.serve = function serve() {
  browserSync.init({
    server: './dist',
    startPath: '/examples',
  });

  gulp.watch(
    './src/**/*',
    { ignoreInitial: false },
    gulp.series(exports.build, reloadBrowser)
  );
};

exports.default = exports.serve;
