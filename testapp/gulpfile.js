'use strict';
var gulp = require('gulp');
var uglify = require('gulp-uglify');
var usemin = require('gulp-usemin');

gulp.task('usemin', function() {
  return gulp.src("map-gulp-usemin.html")
    .pipe(usemin({js: [uglify]}))
    .pipe(gulp.dest('map-gulp-usemin/'));
});

