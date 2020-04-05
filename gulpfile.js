let localhost = 'localhost:3030',
		preprocessor = 'scss',
		fileswatch = 'html,htm,php,txt,yaml,twig,json,md',
		paths = {
			dist: "app/",
			build: "build/",
			src: "src/"
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
			fileinclude = require('gulp-file-include'),
			webpack = require("webpack-stream");

function browsersync() {
	browserSync.init({
		// server: {
		// 	baseDir: paths.dist
		// },
		proxy: localhost, // for PHP
		notify: false
	});
};

function includehtml() {
	return src(paths.src + '*.html')
	.pipe(fileinclude({
		prefix:'@@',
		basepath: '@file'
	}))
	.pipe(dest(paths.dist))
	.pipe(browserSync.stream())
};

function styles() {
	return src(paths.src + preprocessor + '/main.*')
		.pipe(eval(preprocessor)())
		.pipe(concat('main.css'))
		.pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true }))
		.pipe(cleancss( {level: { 1: { specialComments: 0 } } }))
		.pipe(dest(paths.dist + '/css'))
		.pipe(browserSync.stream())
};

function scripts() {
	return src(paths.src + 'js/main.js')
	.pipe(webpack({
		mode: 'development',
		output: {
				filename: 'main.js'
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
	.pipe(dest(paths.dist + 'js/'))
	.pipe(browserSync.stream())
};

function startwatch() {
	watch('src/' + preprocessor + '/**/*', styles);
	// watch(['themes/' + theme + '/assets/js/**/*.js', '!themes/' + theme + '/assets/js/*.min.js', 'themes/' + theme + '/assets/vendor/**/*.js'], scripts);
	watch('src/js/*.js', scripts);
	watch('src/**/*.{' + fileswatch + '}').on('change', browserSync.reload);
	watch('app/**/*.{' + fileswatch + '}').on('change', browserSync.reload);
	watch('src/**/*.html', includehtml);
};

exports.browsersync = browsersync;
exports.assets = parallel(styles, scripts);
exports.styles = styles;
exports.scripts = scripts;
exports.includehtml = includehtml;
exports.default = parallel(styles, scripts, browsersync, startwatch, includehtml);
