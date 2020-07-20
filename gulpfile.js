'use strict';

// --------------------------------------------------------------------------
// Plugins
// --------------------------------------------------------------------------

var gulp         = require('gulp'),
	browserify 	 = require('browserify'),
	buffer       = require('vinyl-buffer'),
	watch 		 = require('gulp-watch'),
	runSequence  = require('run-sequence'),
	concat		 = require('gulp-concat'),
	plumber 	 = require('gulp-plumber'),
	include      = require("gulp-include"),
	critical     = require('critical'),
	pug          = require('gulp-pug'),
	frontMatter  = require('gulp-front-matter'),
	cached       = require('gulp-cached'),
	changed      = require('gulp-changed'),
	minify       = require('gulp-minifier'),
	sass 		 = require('gulp-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	minify_css   = require('gulp-minify-css'),
	cleanCSS     = require('gulp-clean-css'),
	pxtorem      = require('gulp-pxtorem'),
	uglify 		 = require('gulp-uglify'),
	spritesmith  = require('gulp.spritesmith'),
	cheerio 	 = require('gulp-cheerio'),
	svgmin       = require('gulp-svgmin'),
	svgSprite    = require("gulp-svg-sprite"),
	replace      = require('gulp-replace'),
	clean        = require('del'),
	notify       = require("gulp-notify"),
	cache        = require('gulp-cache'),
	path         = require('path'),
	babel 		 = require("gulp-babel"),
	gulpif       = require('gulp-if'),
 	rename       = require('gulp-rename'),
	inject       = require('gulp-inject-string'),
	tap          = require('gulp-tap'),
	source       = require('vinyl-source-stream'),
	terser       = require('gulp-terser'),
	svgo         = require('gulp-svgo');

// --------------------------------------------------------------------------
// Settings [v]
// --------------------------------------------------------------------------

var release_mode = false;

var src = {
	html: 'resources/pug/**/[^_]*.pug',
	
	scssWatch: 'resources/scss/**/*.scss',
	scss: ['./resources/scss/app.scss', './resources/scss/plugins/*'],
	scssThemes: 'resources/scss/themes/*',
	cssPlugins: 'resources/css/**/*.css',

	images: 'resources/images/**/*',
	js: 'resources/js/**/*',
	jsFolderOnly: 'resources/js/',

	sprites: 'resources/sprites/',
	spriteStandalone: 'resources/sprites/_standalone/*.svg',
	spriteImages: 'resources/sprites/_images/',
	spriteSvg: 'resources/sprites/_svg/*.svg',
	spriteSvgInline: 'resources/sprites/_svg/emoji/*.svg'
};

var dist = {
	html: 'public/html/',
	css: 'public/css/',

	cssPlugins: 'public/css/plugins/',
	cssThemes: 'public/css/themes/',

	js: 'public/js/',
	images: 'public/images/',

	sprites: 'public/sprites/',
	spriteImages: 'public/sprites/',
	spriteSvg: 'public/sprites/'
};

// --------------------------------------------------------------------------
// Sprites [v]
// --------------------------------------------------------------------------

gulp.task('spriteImages', function () {
	var spriteData = gulp.src(src.spriteImages + '*.png')
	.pipe(plumber({
		errorHandler: notify.onError("Error: <%= error.message %>")
	}))
	.pipe(spritesmith({

		algorithm: 'binary-tree',
		padding: 10,

		cssName: '_sprites.scss',
		cssFormat: 'scss',

	    imgName: 'sprite.png',
	    imgPath: 'resources/sprites/sprite.png',

	    retinaSrcFilter: src.spriteImages + '/*@2x.png',
        retinaImgName: 'sprite@2x.png',
        retinaImgPath: 'resources/sprites/sprite@2x.png',

	    cssTemplate: 'resources/sprites/_templates/sprite.template.mustache'

	}));

	spriteData.img.pipe(gulp.dest(dist.spriteImages));
	spriteData.css.pipe(gulp.dest(src.sprites));

	return spriteData;
});

gulp.task('spriteSvg', function () {
    return gulp
        .src(src.spriteSvg)
        .pipe(gulpif(release_mode, svgo({inlineStyles: false})))
        .pipe(cheerio({
			run: function ($) {
				// $('[fill]:not([fill="currentColor"])').removeAttr('fill');
				$('[stroke]').removeAttr('stroke');
				$('[fill]').removeAttr('fill');
			},
			parserOptions: { xmlMode: false }
		}))
		.pipe(replace('&gt;', '>'))
        .pipe(svgSprite({
        	mode: {
				symbol: {
					dest: "",
					prefix : '.',
            		dimensions : '.',
					sprite: "sprite.svg",
					render: {
						scss: {
							dest: '../../' + src.sprites + '_spritesSvg.scss',
							template: "resources/sprites/_templates/scss.templateSvg.handlebars"
						}
					}
				}
			}
        }))
        .pipe(gulp.dest(dist.sprites));
});

gulp.task('spriteSvgInline', function () {
    return gulp
        .src(src.spriteSvgInline)
        .pipe(svgSprite({
        	mode: {
				symbol: {
					dest: "",
					prefix : '.',
            		dimensions : '.',
					sprite: "spriteSvgInline.svg",
					render: {
						scss: {
							dest:'../../' + src.sprites + '_spriteSvgInline.scss',
							template: "resources/sprites/_templates/scss.templateSvg.handlebars"
						}
					}
				}
			}
        }))
        .pipe(cheerio({
			run: function ($) {
				$('svg').attr('style',  'display:none');
				// $('[fill]').removeAttr('fill');
				// $('[stroke]').removeAttr('stroke');
				// $('[style]').removeAttr('style');
			},
			parserOptions: { xmlMode: true }
		}))
		.pipe(replace('&gt;', '>'))
		.pipe(replace('<?xml version="1.0" encoding="utf-8"?>', ''))
        .pipe(gulp.dest(src.sprites));
});

gulp.task('spriteStandalone', function() {
	return gulp
		.src(src.spriteStandalone)
		.pipe(gulp.dest(dist.sprites))
});

// --------------------------------------------------------------------------
// Critical [v]
// --------------------------------------------------------------------------
/*
gulp.task('critical', function () {

	return gulp
			.src(dist.html + '*.html')
			.pipe(tap(function(file) {

				var filename = path.basename(file.path, '.html');

				critical.generate({
					inline: false,
					base: 'public/html/',
					src: filename + '.html',
					css: ['public/css/app.min.css'],
					dest: '../css/critical/' + filename + '-critical.css',
					minify: true,
					width: 375,
					height: 812,
					ignore: ['font-face', '.panel__comment-info-btn']

				})
				.then(function (criticalCss) {
					gulp.src('public/html/' + filename + '.html')
					//	.pipe(inject.after('<!-- Critical CSS -->', '\n<style id="critical">' + criticalCss + '</style>'))
						.pipe(gulp.dest(dist.html))
				});

		}));
});
*/
// --------------------------------------------------------------------------
// Html or Pug [v]
// --------------------------------------------------------------------------
/*
gulp.task('html', function() {

	return gulp.src(src.html)
		.pipe(plumber({
			errorHandler: notify.onError("Error: <%= error.message %>")
		}))
		.pipe(frontMatter({ property: 'data' }))
		.pipe(pug({
			pretty: true
		}))
		.pipe(cached('pug'))
		.pipe(gulp.dest(dist.html))

});
*/
// --------------------------------------------------------------------------
// Images [v]
// --------------------------------------------------------------------------

gulp.task('images', function() {

	return gulp.src(src.images)
		.pipe(gulp.dest(dist.images))

});

// --------------------------------------------------------------------------
// Scss [v]
// --------------------------------------------------------------------------

gulp.task('scss:themes', function() {

	return gulp.src(src.scssThemes)
		.pipe(plumber({
			errorHandler: notify.onError("Error: <%= error.message %>")
		}))
		.pipe(sass())
		.pipe(autoprefixer({
		    browsers: ['last 3 versions', '> 1%', 'ie 11'],
		    cascade: false
		}))
		.pipe(pxtorem({rootValue: 10}))
		.pipe(gulpif(release_mode, cleanCSS()))
		.pipe(gulpif(release_mode, minify_css()))
		.pipe(gulp.dest(dist.cssThemes))
});

gulp.task('scss', function() {

	return gulp.src(src.scss)
		.pipe(plumber({
			errorHandler: notify.onError("Error: <%= error.message %>")
		}))
		.pipe(sass())
		.pipe(autoprefixer({
		    browsers: ['last 3 versions', '> 1%', 'ie 11'],
		    cascade: false
		}))
		.pipe(concat('app.min.css'))
		.pipe(pxtorem({rootValue: 10}))

		.pipe(gulpif(release_mode, minify_css()))
		.pipe(gulp.dest(dist.css))
});

// --------------------------------------------------------------------------
// CSS Plugins
// --------------------------------------------------------------------------

gulp.task('css_plugins', function() {
	return gulp.src([
		src.cssPlugins,
		path.resolve('node_modules', 'suggestions-jquery/dist/css/suggestions.min.css'),
		'!resources/css/leaflet.css'
		])
		.pipe(autoprefixer({
			browsers: ['last 3 versions', '> 1%', 'ie 11'],
			cascade: false
		}))
		.pipe(pxtorem({rootValue: 10}))
		.pipe(gulpif(release_mode, cleanCSS()))
		.pipe(gulpif(release_mode, minify_css()))
		.pipe(gulp.dest(dist.css))
});

gulp.task('css', [
	'scss',
	'scss:themes',
	'css_plugins',
]);

// --------------------------------------------------------------------------
// UPPY file uploader
// --------------------------------------------------------------------------

var uppy_css = [
	path.resolve('node_modules', '@uppy/core/dist/style.css'),
	path.resolve('node_modules', '@uppy/file-input/dist/style.css'),
	path.resolve('node_modules', '@uppy/progress-bar/dist/style.css'),
];

gulp.task('uppy_css', function() {
	return gulp.src(uppy_css)
		.pipe(autoprefixer({
			browsers: ['last 3 versions', '> 1%', 'ie 11'],
			cascade: false
		}))
		.pipe(concat('uppy.min.css'))
		.pipe(pxtorem({rootValue: 10}))
		.pipe(gulpif(release_mode, cleanCSS()))
		.pipe(gulpif(release_mode, minify_css()))
		.pipe(gulp.dest(dist.css))
});

gulp.task('uppy_js', function() {
	browserify({
		entries: ['resources/js/uppy.js']
	})
	.bundle()
	.pipe(source('uppy.js'))
	.pipe(buffer())
	.pipe(gulpif(release_mode, terser()))
	.pipe(gulp.dest(dist.js));
});

// --------------------------------------------------------------------------
// Turf js [v]
// --------------------------------------------------------------------------

gulp.task('turf_js', function() {
	browserify({
		insertGlobals : true,
		entries: ['resources/js/turf.js'],
		})
		.bundle()
		.pipe(source('turf.js'))
		.pipe(buffer())
		.pipe(gulpif(release_mode, terser()))
		.pipe(gulp.dest(dist.js));
});

// --------------------------------------------------------------------------
// Leaflet [v]
// --------------------------------------------------------------------------

var leaflet_plugins = [
	path.resolve('node_modules', 'leaflet-plugins/layer/tile/Yandex.js'),
	path.resolve('node_modules', 'leaflet-plugins/layer/tile/Yandex.addon.LoadApi.js'),
	path.resolve('node_modules', 'leaflet-plugins/layer/tile/Yandex.addon.Fullscreen.js'),
	path.resolve('node_modules', 'leaflet-plugins/layer/tile/Yandex.addon.Controls.js'),
	path.resolve('node_modules', 'leaflet-plugins/layer/tile/Yandex.addon.Panorama.js'),
	path.resolve('node_modules', 'leaflet.markercluster/dist/leaflet.markercluster.js'),
	path.resolve('node_modules', 'rbush/rbush.min.js'),
];

gulp.task('js:leaflet_plugins', function() {
	return gulp.src(leaflet_plugins)
		.pipe(plumber({
			errorHandler: notify.onError("Error: <%= error.message %>")
		}))
		.pipe(concat('leaflet.plugins.min.js'))
		.pipe(gulpif(release_mode, terser()))
		.pipe(gulp.dest(dist.js))
});

var leaflet_css = [
	'resources/css/leaflet.css',
	path.resolve('node_modules', 'leaflet.markercluster/dist/MarkerCluster.css'),
	path.resolve('node_modules', 'leaflet.markercluster/dist/MarkerCluster.Default.css'),
];

gulp.task('leaflet_css', function() {
	return gulp.src(leaflet_css)
		.pipe(autoprefixer({
			browsers: ['last 3 versions', '> 1%', 'ie 11'],
			cascade: false
		}))
		.pipe(concat('leaflet.min.css'))
		.pipe(pxtorem({rootValue: 10}))
		.pipe(gulpif(release_mode, cleanCSS()))
		.pipe(gulpif(release_mode, minify_css()))
		.pipe(gulp.dest(dist.css))
});

// --------------------------------------------------------------------------
// Js [v]
// --------------------------------------------------------------------------

var ClientFullModules = [
	path.resolve('node_modules', 'svgxuse/svgxuse.min.js'),
	path.resolve('node_modules', 'es6-promise/dist/es6-promise.auto.min.js'),
	path.resolve('node_modules', 'match-media/matchMedia.js'),
	path.resolve('node_modules', 'quicklink/dist/quicklink.umd.js'),
	path.resolve('node_modules', 'jquery/dist/jquery.js'),
	'resources/js/jquery.passive_events.js',
	//path.resolve('node_modules', '@tarekraafat/autocomplete.js/dist/js/autoComplete.min.js'),
	path.resolve('node_modules', 'readmore-js/readmore.js'),
	path.resolve('node_modules', 'jquery-touchswipe/jquery.touchSwipe.js'),
	path.resolve('node_modules', 'selectric/public/jquery.selectric.js'),
	path.resolve('node_modules', 'photoswipe/dist/photoswipe.js'),
	path.resolve('node_modules', 'photoswipe/dist/photoswipe-ui-default.js'),
	path.resolve('node_modules', 'owl.carousel/dist/owl.carousel.js'),
	path.resolve('node_modules', 'smooth-scrollbar/dist/smooth-scrollbar.js'),
	path.resolve('node_modules', 'tooltipster/dist/js/tooltipster.bundle.js'),
	path.resolve('node_modules', 'sticky-kit/dist/sticky-kit.js'),
	path.resolve('node_modules', 'priority-nav/dist/priority-nav.js'),
	path.resolve('node_modules', '@claviska/jquery-minicolors/jquery.minicolors.js'),
	path.resolve('node_modules', 'chart.js/dist/Chart.js'),
	path.resolve('node_modules', 'autosize/dist/autosize.js'),
	path.resolve('node_modules', 'sweetalert2/dist/sweetalert2.min.js'),
	path.resolve('node_modules', 'js-base64/base64.min.js'),
	path.resolve('node_modules', 'ua-parser-js/dist/ua-parser.min.js'),
	path.resolve('node_modules', 'fingerprintjs2/fingerprint2.js'),
	path.resolve('node_modules', 'garlicjs/dist/garlic.min.js'),
	'resources/js/all_pages.js',
];

var ClientStandartModules = [
	path.resolve('node_modules', 'svgxuse/svgxuse.min.js'),
	path.resolve('node_modules', 'es6-promise/dist/es6-promise.auto.min.js'),
	path.resolve('node_modules', 'match-media/matchMedia.js'),
	path.resolve('node_modules', 'quicklink/dist/quicklink.umd.js'),
	path.resolve('node_modules', 'jquery/dist/jquery.js'),
	'resources/js/jquery.passive_events.js',
	//path.resolve('node_modules', '@tarekraafat/autocomplete.js/dist/js/autoComplete.min.js'),
	path.resolve('node_modules', 'readmore-js/readmore.js'),
	path.resolve('node_modules', 'sticky-kit/dist/sticky-kit.js'),
	path.resolve('node_modules', 'jquery-touchswipe/jquery.touchSwipe.js'),
	//path.resolve('node_modules', 'selectric/public/jquery.selectric.js'),
	path.resolve('node_modules', 'owl.carousel/dist/owl.carousel.min.js'),
	path.resolve('node_modules', 'smooth-scrollbar/dist/smooth-scrollbar.js'),
	path.resolve('node_modules', 'priority-nav/dist/priority-nav.js'),
	path.resolve('node_modules', 'medium-zoom/dist/medium-zoom.min.js'),
	path.resolve('node_modules', 'photoswipe/dist/photoswipe.min.js'),
	path.resolve('node_modules', 'photoswipe/dist/photoswipe-ui-default.min.js'),
	path.resolve('node_modules', 'tooltipster/dist/js/tooltipster.bundle.min.js'),
	path.resolve('node_modules', 'autosize/dist/autosize.js'),
	path.resolve('node_modules', 'sweetalert2/dist/sweetalert2.min.js'),
	path.resolve('node_modules', 'js-base64/base64.min.js'),
	path.resolve('node_modules', 'ua-parser-js/dist/ua-parser.min.js'),
	path.resolve('node_modules', 'fingerprintjs2/fingerprint2.js'),
	path.resolve('node_modules', 'garlicjs/dist/garlic.min.js'),
	'resources/js/all_pages.js',
];

var ClientShortModules = [
	path.resolve('node_modules', 'svgxuse/svgxuse.min.js'),
	path.resolve('node_modules', 'es6-promise/dist/es6-promise.auto.min.js'),
	path.resolve('node_modules', 'match-media/matchMedia.js'),
	path.resolve('node_modules', 'quicklink/dist/quicklink.umd.js'),
	path.resolve('node_modules', 'jquery/dist/jquery.js'),
	'resources/js/jquery.passive_events.js',
	path.resolve('node_modules', 'readmore-js/readmore.js'),
	path.resolve('node_modules', 'sticky-kit/dist/sticky-kit.js'),
	path.resolve('node_modules', 'jquery-touchswipe/jquery.touchSwipe.js'),
//	path.resolve('node_modules', 'selectric/public/jquery.selectric.js'),
	path.resolve('node_modules', 'owl.carousel/dist/owl.carousel.min.js'),
	path.resolve('node_modules', 'smooth-scrollbar/dist/smooth-scrollbar.js'),
	path.resolve('node_modules', 'priority-nav/dist/priority-nav.js'),
	path.resolve('node_modules', 'tooltipster/dist/js/tooltipster.bundle.min.js'),
	//path.resolve('node_modules', 'autosize/dist/autosize.js'),
	path.resolve('node_modules', 'sweetalert2/dist/sweetalert2.min.js'),
	//path.resolve('node_modules', 'js-base64/base64.min.js'),
	//path.resolve('node_modules', 'ua-parser-js/dist/ua-parser.min.js'),
	//path.resolve('node_modules', 'fingerprintjs2/fingerprint2.js'),
	'resources/js/all_pages.js',
];

gulp.task('js:pages', function() {
	return gulp.src(src.js)
    .pipe(plumber({
		errorHandler: notify.onError("Error: <%= error.message %>")
	}))
	.pipe(gulpif(release_mode, terser()))
	.pipe(gulp.dest(dist.js));

// to concat each page file with all_pages.js :

//	.pipe(tap(function (file, t) {
//
//				var fileName = path.basename(file.path);
//
//				gulp.src(['resources/js/all_pages.js', file.path])
//				.pipe(concat(fileName))
//				.pipe(gulpif(release_mode, uglify()))
//				.pipe(gulp.dest(dist.js));
//
//	}));

});

gulp.task('js:full_lib', function() {
	return gulp.src(ClientFullModules)
    .pipe(plumber({
		errorHandler: notify.onError("Error: <%= error.message %>")
	}))
    .pipe(concat('app.full.min.js'))
    .pipe(gulpif(release_mode, terser()))
    .pipe(gulp.dest(dist.js))
});

gulp.task('js:standart_lib', function() {
	return gulp.src(ClientStandartModules)
		.pipe(plumber({
			errorHandler: notify.onError("Error: <%= error.message %>")
		}))
		.pipe(concat('app.standart.min.js'))
		.pipe(gulpif(release_mode, terser()))
		.pipe(gulp.dest(dist.js))
});

gulp.task('js:short_lib', function() {
	return gulp.src(ClientShortModules)
		.pipe(plumber({
			errorHandler: notify.onError("Error: <%= error.message %>")
		}))
		.pipe(concat('app.short.min.js'))
		.pipe(gulpif(release_mode, terser()))
		.pipe(gulp.dest(dist.js))
});

gulp.task('js:plugins', function() {
	return gulp.src([
		//src.jsPlugins,
		path.resolve('node_modules', 'suggestions-jquery/dist/js/jquery.suggestions.min.js')
	])
		.pipe(plumber({
			errorHandler: notify.onError("Error: <%= error.message %>")
		}))
		.pipe(gulpif(release_mode, terser()))
		.pipe(gulp.dest(dist.js));
});

gulp.task('js', [
	'js:pages',
	'js:plugins',
	'js:full_lib',
	'js:standart_lib',
	'js:short_lib',
	'uppy_css',
	'uppy_js',
	'leaflet_css',
	'js:leaflet_plugins',
	'turf_js'
]);

// --------------------------------------------------------------------------
// Clean [v]
// --------------------------------------------------------------------------

gulp.task('clean', function(cb) {
    return clean(['public/**/*', '!public/index.php'], cb);
});

gulp.task('release', function(cb) {
    return clean(['public/html/'], cb);
});

// --------------------------------------------------------------------------
// Minify [v]
// --------------------------------------------------------------------------
/*
gulp.task('minify:html', function() {
    return gulp.src(dist.html +'*.html')
	    .pipe(minify({
	    	minify: true,
		    minifyHTML: {
		      collapseWhitespace: true,
		      conservativeCollapse: true,
		    },
		    minifyJS: {
		      sourceMap: true
		    },
		    minifyCSS: true,
		    getKeptComment: function (content, filePath) {
		        var m = content.match(/\/\*![\s\S]*?\*\//img);
		        return m && m.join('\n') + '\n' || '';
		    }
	    }))
	    .pipe(gulp.dest(dist.html));
});
*/

//gulp.task('minify:critical', function() {
// return gulp.src(dist.css + 'critical/**/*.css')
//		.pipe(minify_css())
//   	.pipe(gulp.dest(dist.css + 'critical'))
//	
//});

gulp.task('minify:css', function() {
	
    return gulp.src(dist.css + '**/*.css')
		.pipe(minify_css())
    	.pipe(gulp.dest(dist.css))
	
});

gulp.task('minify:js', function() {
	
	return gulp.src(dist.js + '**/*.js')
		.pipe(terser())
    	.pipe(gulp.dest(dist.js))
	
});

gulp.task('minify', [
	//'minify:html',
	'minify:css',
	//'minify:critical',
	'minify:js'
]);

// --------------------------------------------------------------------------
// Watch
// --------------------------------------------------------------------------

gulp.task('watch', [], () => {

	console.log(" ");
	console.log("Watching for changes...");
	console.log(" ");

	gulp.watch(src.spriteImages + '*.png', ['default']);
	gulp.watch(src.spriteSvg, ['default']);
	gulp.watch(src.spriteSvgInline, ['default']);
	gulp.watch(src.spriteStandalone, ['default']);

	//gulp.watch(src.html, ['html']);
	//gulp.watch(['resources/pug/**/_*.pug', 'resources/pug/**/[^_]*.pug'], ['html']);

	gulp.watch(src.images, ['default']);
	gulp.watch(src.scssWatch, ['default']);
	gulp.watch(src.scssThemes, ['default']);
	gulp.watch(src.js, ['default']);
	gulp.watch('resources/js/all_pages.js', ['default']);

});

// Gulp
gulp.task('default', function() {
	
	if (release_mode)
	{
		runSequence('clean', 'spriteImages', 'spriteSvg', 'spriteSvgInline', 'spriteStandalone', 'js', 'css', 'images', 'release');
	}
	else
	{
		runSequence('clean', 'spriteImages', 'spriteSvg', 'spriteSvgInline', 'spriteStandalone',  'js', 'css', 'images');
	}
	
});
gulp.task('update-js', function() {
	return gulp.src([
		'node_modules/jquery-validation/dist/jquery.validate.js',
		'node_modules/jquery-sortable/source/js/jquery-sortable.js',
		'resources/js/update.js',
	])
		.pipe(concat('update.js'))
		.pipe(gulp.dest(dist.js))
});