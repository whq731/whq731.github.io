// 引入 gulp
var gulp = require('gulp'); 

// 引入组件

var minifycss = require('gulp-minify-css');
var rename = require('gulp-rename');
var imagemin = require('gulp-imagemin');
var closureCompiler = require('gulp-closure-compiler');


// 脚本压缩任务
gulp.task('scripts', function() {
  // 排除所有min 文件和模板
  var jsSrc = './hosts/api/js/*.js',
      jsDst = './hosts/api/newJs/';
  return gulp.src([jsSrc,'!./hosts/api/js/*.min.js','!./hosts/api/js/template.js'])
    .pipe(closureCompiler({
      compilerPath: 'compiler.jar',
      fileName: 'build.js'
    }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(jsDst));
});

// 样式处理任务
gulp.task('css', function () {
    var cssSrc = './hosts/api/css/*.css',
        cssDst = './hosts/api/newCss/';
    return gulp.src(cssSrc)
        .pipe(gulp.dest(cssDst))
        .pipe(minifycss())
        .pipe(gulp.dest(cssDst));
});

// 图片压缩任务
gulp.task('images', function () {
    var imgSrc = './hosts/api/images/checkout/*.png',
        imgDst = './hosts/api/newImages/';
    return gulp.src(imgSrc)
        .pipe(imagemin())
        .pipe(gulp.dest(imgDst));
});

// 监视文件任务
gulp.task('watch', function() {
    gulp.watch('./hosts/api/js/', ['scripts']);
    gulp.watch('./hosts/api/images/checkout/', ['images']);
    gulp.watch('./hosts/api/css/*.css', ['css']);
});

// 默认任务
gulp.task('default', ['scripts', 'images','css', 'watch']);
