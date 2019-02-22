/*global require*/
"use strict";

var gulp = require('gulp'),
  path = require('path'),
  data = require('gulp-data'),
  pug = require('gulp-pug'),
  prefix = require('gulp-autoprefixer'),
  sass = require('gulp-sass'),
  cssbeautify = require('gulp-cssbeautify'),
  htmlbeautify = require('gulp-html-beautify'),
  browserSync = require('browser-sync'),
  cache = require('gulp-cache'),
  imagemin = require('gulp-imagemin');

/*
 * Directories here
 */
var paths = {
  build: './build/',
  scss: './assets/scss/',
  css: './build/css/',
  data: './_data/',
  images: './assets/images',
  watchPug: './template/**/*.pug'
};

/**
 * Compile .pug files and pass in data from json file
 * matching file name. index.pug - index.pug.json
 */

gulp.task('pug', function () {
  return gulp.src('template/pages/*.pug')
    // .pipe(data(function (file) {
    //   return require(paths.data + path.basename(file.path) + '.json');
    // }))
    .pipe(pug())
    .on('error', function (err) {
      process.stderr.write(err.message + '\n');
      this.emit('end');
    })
    .pipe(htmlbeautify({ "indent_size": 4 }))
    .pipe(gulp.dest(paths.build));
});

/**
 * Recompile .pug files and live reload the browser
 */
gulp.task('rebuild', ['pug'], function () {
  browserSync.reload();
});

/**
 * Wait for pug and sass tasks, then launch the browser-sync Server
 */
gulp.task('browser-sync', ['scss', 'pug', 'images'], function () {
  browserSync({
    server: {
      baseDir: paths.build,
      directory: true
    },
    notify: false
  });
});

/**
 * Compile .scss files into public css directory With autoprefixer no
 * need for vendor prefixes then live reload the browser.
 */
gulp.task('scss', function () {
  return gulp.src(paths.scss + '*.scss')
    .pipe(sass({
      includePaths: [paths.scss],
      outputStyle: 'compressed'
    }))
    .on('error', sass.logError)
    .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {
      cascade: true
    }))
    .pipe(cssbeautify({
      indent: '  ',
      openbrace: 'separate-line',
      autosemicolon: true
    }))
    .pipe(gulp.dest(paths.css))
    .pipe(browserSync.reload({
      stream: true
    }));
});

/**
 * Copy images to build folder
 */

gulp.task('images', function () {
  return gulp.src('assets/images/*')
    .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
    .pipe(gulp.dest('build/images/'))
});

/**
 * Watch scss files for changes & recompile
 * Watch .pug files run pug-rebuild then reload BrowserSync
 */
gulp.task('watch', function () {
  gulp.watch([paths.scss + '**/*.scss', './assets/scss/*.scss'], ['scss']);
  gulp.watch(paths.watchPug, ['rebuild']);
  gulp.watch('assets/images/*', ['images']);
});

// Build task compile sass and pug.
gulp.task('build', ['scss', 'pug']);

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync then watch
 * files for changes
 */
gulp.task('default', ['browser-sync', 'watch']);