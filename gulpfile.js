var gulp = require('gulp');
var clean = require('gulp-clean');
var uglify = require('gulp-uglify');
var rename = require("gulp-rename");

gulp.task('clean', function(callback){
  return gulp.src('./dist', {read: false})
    .pipe(clean());
});

gulp.task('scripts', ['clean'], function(){
  return gulp.src('./src/intent.js')
    .pipe(uglify({
      preserveComments: "license"
    }))
    .pipe(rename("intent.min.js"))
    .pipe(gulp.dest('./dist'));
});

gulp.task('watch', function(callback) {
  return gulp.watch(
    ['./src/*.js'],
    ['clean', 'scripts']
  );
});

gulp.task('default', ['clean', 'scripts']);
