var gulp = require('gulp'),
	revReplace = require('gulp-rev-replace'),
	uglify = require('gulp-uglify'),
	clean = require('gulp-clean'),
	rename = require('gulp-rename'),
	rev = require('gulp-rev');

gulp.task('clean', function() {
  return gulp.src('./build', {read: false})
	.pipe(clean());
});

gulp.task('jsMinify', function() {
  return gulp.src('hosts/js/*.js')
    .pipe(uglify())
    .pipe(rev())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('./build/hosts/js'))
    .pipe(rev.manifest({base:'', merge: true}))
	.pipe(gulp.dest('./build/rev/'))
});

gulp.task("revreplace", ["jsMinify"], function(){
  var manifest = gulp.src("./build/rev/rev-manifest.json");
  return gulp.src("./tpl/**/*.tpl")
    .pipe(revReplace({replaceInExtensions: ['.tpl'], manifest: manifest}))
    .pipe(gulp.dest('./build/tpl/'));
});
gulp.task('default', ['clean','revreplace']);