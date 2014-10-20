var gulp   = require('gulp');
var stylus = require('gulp-stylus');
var nib = require('nib');
var concat = require('gulp-concat');
var minifyCSS = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var gulpBowerFiles = require('gulp-bower-files');
var spritesmith = require('gulp.spritesmith');
var imagemin = require('gulp-imagemin');
var minifyHTML = require('gulp-minify-html');
var coffee  = require('gulp-coffee');
var gulpif = require('gulp-if');

/*--- CONFIG ---*/
var config = require('./config.json');

/*--- STYLUS ---*/
gulp.task('stylus', function () {
  gulp.src(config.source.stylus)
    .pipe(stylus({use: [nib()]}))
    .pipe(concat(config.main.style))
    .pipe(minifyCSS())
    .pipe(gulp.dest(config.dest.style));
});

/*--- COFFEE SCRIPTS ---*/
gulp.task('coffee', function () {
  gulp.src(config.source.coffee)
    .pipe(coffee())
    .pipe(concat(config.main.compiled_coffee))
    .pipe(gulp.dest(config.source.script));
});

/*--- SCRIPTS ---*/
gulp.task('scripts', ['coffee'], function () {
  gulp.src(config.source.scripts)
  	.pipe(coffee())
    .pipe(concat(config.main.script))
    .pipe(uglify())
    .pipe(gulp.dest(config.dest.script));
});

/*--- BUNDLE BOWER ---*/
gulp.task("bower-files", function(){
    gulpBowerFiles().pipe(gulp.dest(config.dest.bower));
});

/*--- IMAGES ---*/
gulp.task('sprite', function () {
  // Generate our spritesheet
  var spriteData = gulp.src(config.source.sprites).pipe(spritesmith({
    imgName: 'sprite.png',
    cssName: 'sprite.css'
  }));

  // Pipe image stream through image optimizer and onto disk
  spriteData.img
    .pipe(imagemin({progressive: true}))
    .pipe(gulp.dest(config.dest.sprite));

  // Pipe CSS stream through CSS optimizer and onto disk
  spriteData.css
    .pipe(minifyCSS())
    .pipe(gulp.dest(config.dest.style));
});


/*--- HTML ---*/
gulp.task('minify-html', function() {
  gulp.src(config.source.html)
    .pipe(minifyHTML())
    .pipe(gulp.dest(config.dest.html))
});


/*--- WATCH ---*/
gulp.task('watch', function(){
	gulp.watch(config.source.script, ['scripts']);
	gulp.watch(config.source.stylus, ['stylus']);
	gulp.watch(config.source.html, ['minify-html']);
	gulp.watch(config.source.sprites, ['sprite']);
});

/*--- BUILD ---*/
gulp.task('build', ['clean', 'stylus', 'scripts', 'bower-files', 'sprite', 'minify-html']);

/*--- DEFAULT ---*/
gulp.task('default', ['watch', 'stylus', 'scripts', 'minify-html']);
