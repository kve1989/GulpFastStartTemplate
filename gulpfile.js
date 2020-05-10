let localhost = 'localhost:3030',
		preprocessor = 'scss', // Preprocessor (sass, scss)
		fileswatch = 'html,htm,php,txt,yaml,twig,json,md',
		baseDir = 'app';

let paths = {
		build: "build/",
		dist: "app/",
		src: "app/#src/",

		scripts: {
			src: [
				baseDir + '/#src/js/main.js'
			],
			dest: baseDir + '/js',
		},

		styles: {
			src: baseDir + '/#src/' + preprocessor + '/main.*',
			dest: baseDir + '/css',
		},


		cssOutputName: 'main.min.css',
		jsOutputName: 'main.min.js',
};


const { src, dest, parallel, series, watch } = require('gulp'),
			sass = require('gulp-sass'),
			scss = require('gulp-sass'),
			browserSync = require('browser-sync').create(),
			rename = require('gulp-rename'),
			uglify = require('gulp-uglify'),
			concat = require('gulp-concat'),
			cleancss = require('gulp-clean-css'),
			autoprefixer = require('gulp-autoprefixer'),
			webpack = require("webpack-stream");

function browsersync() {
	browserSync.init({
		server: { baseDir: baseDir + '/' },
		// proxy: localhost, // for PHP
		notify: false
	});
};

function styles() {
	return src(paths.styles.src)
		.pipe(eval(preprocessor)())
		.pipe(concat(paths.cssOutputName))
		.pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true }))
		.pipe(cleancss( {level: { 1: { specialComments: 0 } } }))
		.pipe(dest(paths.styles.dest))
		.pipe(browserSync.stream())
};

function scripts() {
	return src(paths.scripts.src)
	.pipe(webpack({
		mode: 'development',
		output: {
				filename: paths.jsOutputName
		},
		watch: false,
		devtool: "source-map",
		module: {
				rules: [
					{
						test: /\.m?js$/,
						exclude: /(node_modules|bower_components)/,
						use: {
							loader: 'babel-loader',
							options: {
								presets: [['@babel/preset-env', {
										debug: true,
										corejs: 3,
										useBuiltIns: "usage"
								}]]
							}
						}
					}
				]
			}
	}))
	// .pipe(uglify())
	.pipe(dest(paths.scripts.dest))
	.pipe(browserSync.stream())
};

function startwatch() {
	watch(baseDir + '/**/' + preprocessor + '/**/*', styles);
	// watch(['themes/' + theme + '/assets/js/**/*.js', '!themes/' + theme + '/assets/js/*.min.js', 'themes/' + theme + '/assets/vendor/**/*.js'], scripts);
	watch([baseDir + '/**/*.js', '!' + paths.scripts.dest + '/*.min.js'], scripts);
	watch(baseDir + '/**/*.{' + fileswatch + '}').on('change', browserSync.reload);
};

exports.browsersync = browsersync;
exports.assets = parallel(styles, scripts);
exports.styles = styles;
exports.scripts = scripts;
exports.includehtml = includehtml;
exports.default = parallel(styles, scripts, browsersync, startwatch);
