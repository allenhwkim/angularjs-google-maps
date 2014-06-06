var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var debug = require('gulp-debug');
var rename = require('gulp-rename');
var stripDebug = require('gulp-strip-debug');
var filesize = require('gulp-filesize');
var gutil = require('gulp-util');
var clean = require('gulp-clean');
var runSequence = require('run-sequence');
var gutil = require('gulp-util');
var through = require('through2');
var replace = require('gulp-replace');

gulp.task('clean', function() {
  return gulp.src('bulid')
    .pipe(clean({force: true}));
});

gulp.task('build-js', function() {
  return gulp.src(['app/scripts/*.js', 'app/scripts/**/*.js'])
    .pipe(concat('ng-map.js'))
    .pipe(gulp.dest('build/scripts'))
    .pipe(filesize())
    .pipe(stripDebug())
    .pipe(uglify())
    .pipe(rename('ng-map.min.js'))
    .pipe(gulp.dest('build/scripts'))
    .pipe(filesize())
    .on('error', gutil.log);
});

gulp.task('copy', function() {
  return gulp.src('./testapp/scripts/*')
    .pipe(gulp.dest('./build/scripts'))
    .pipe(gulp.src('./testapp/css/*'))
    .pipe(gulp.dest('./build/css'))
});

gulp.task('build-html', function() {
  return gulp.src('./testapp/*.html')
    .pipe(replace(
      /<!-- build:js ([^ ]+) -->[^\!]+<!-- endbuild -->/gm, 
      function(natch, $1) {
        {return '<script src="' + $1+'"></script>';}
      }
    ))
    .pipe(gulp.dest('./build'));
});

gulp.task('build', function(callback) {
  runSequence('clean', 'build-js', 'copy', 'build-html', callback);
});
