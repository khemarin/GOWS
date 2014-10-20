var gulp   = require('gulp');
var stylus = require('gulp-stylus');
var nib = require('nib');
var concat = require('gulp-concat');
var minifyCSS = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var mainBowerFiles = require('main-bower-files');
var spritesmith = require('gulp.spritesmith');
var imagemin = require('gulp-imagemin');
var minifyHTML = require('gulp-minify-html');
var coffee  = require('gulp-coffee');
var gulpif = require('gulp-if');
var gulpFilter = require('gulp-filter');
var rename = require('gulp-rename');
var flatten = require('gulp-flatten');

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
  gulp.src(config.source.script)
    .pipe(concat(config.main.script))
    .pipe(uglify())
    .pipe(gulp.dest(config.dest.script));
});

/*--- BUNDLE BOWER ---*/
gulp.task("bower-files", function(){
    var jsFilter = gulpFilter('**/*.js', '!**/*.min.js');
    var cssFilter = gulpFilter('**/*.css', '!**/*.min.css');
    var fontFilter = gulpFilter(['**/*.eot', '**/*.woff', '**/*.svg', '**/*.ttf', '**/*.otf']);
    
    return gulp.src(mainBowerFiles())

    // grab vendor js files from bower_components, minify and push in dest
    .pipe(jsFilter)
    .pipe(gulp.dest(config.dest.bower + '/js'))
    .pipe(uglify())
    .pipe(gulp.dest(config.dest.bower + '/js'))
    .pipe(jsFilter.restore())

    // grab vendor css files from bower_components, minify and push in dest
    .pipe(cssFilter)
    .pipe(gulp.dest(config.dest.bower + '/css'))
    .pipe(minifyCSS())
    .pipe(gulp.dest(config.dest.bower + '/css'))
    .pipe(cssFilter.restore())

    // grab vendor font files from bower_components and push in dest 
    .pipe(fontFilter)
    .pipe(flatten())
    .pipe(gulp.dest(config.dest.bower + '/fonts'))
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
