let gulp = require('gulp'),
	sass = require('gulp-sass'),
	browserSync = require('browser-sync'),
	rename = require('gulp-rename'),
	uglify = require('gulp-uglify'),
	concat = require('gulp-concat'),
	autoprefixer = require('gulp-autoprefixer'),
	fileinclude = require('gulp-file-include'),
	del = require('del'),
	webpack = require("webpack-stream");

let dist = "./app/";
let build = "./build/";

// Local Server
gulp.task('browser-sync', function () {
	browserSync.init({
		server: {
			baseDir: dist
		},
		notify: false,
		port: 2233
	});
});

// Task clean folder dist
gulp.task('clean', async function () {
	del.sync(build)
})

// HTML
gulp.task('html', function () {
	return gulp.src('./src/*.html')
	.pipe(fileinclude({
		prefix:'@@',
		basepath: '@file'
	}))
	.pipe(gulp.dest(dist))
	.pipe(browserSync.reload({
		stream: true
	}))
});

// Custom Styles
gulp.task('styles', function () {
	return gulp.src('src/scss/**/*.scss')
		.pipe(sass({
			outputStyle: 'expanded',
			includePaths: [__dirname + '/node_modules']
		}))
		.pipe(concat('main.css'))
		.pipe(autoprefixer({
			// grid: true, // Optional. Enable CSS Grid
			overrideBrowserslist: ['last 10 versions']
		}))
		// .pipe(cleancss({
		// 	level: {
		// 		1: {
		// 			specialComments: 0
		// 		}
		// 	}
		// })) // Optional. Comment out when debugging
		.pipe(gulp.dest(dist + '/css'))
		.pipe(browserSync.stream())
});

// Custom Scripts
gulp.task('scripts', () => {
	return gulp.src('./src/js/main.js')
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
	.pipe(gulp.dest(dist + 'js/'))
	.pipe(browserSync.reload({
		stream: true
	}))
});

gulp.task('export', function () {
	let buildHtml = gulp.src('app/**/*.html')
		.pipe(gulp.dest('dist'));

	let BuildCss = gulp.src('app/css/**/*.css')
		.pipe(gulp.dest('dist/css'));

	let BuildJs = gulp.src('app/js/**/*.js')
		.pipe(gulp.dest('dist/js'));

	let BuildFonts = gulp.src('app/fonts/**/*.*')
		.pipe(gulp.dest('dist/fonts'));

	let BuildImg = gulp.src('app/img/**/*.*')
		.pipe(gulp.dest('dist/img'));
});

gulp.task('watch', function () {
	gulp.watch('src/scss/**/*.scss', gulp.parallel('styles'));
	gulp.watch('src/js/**/*.js', gulp.parallel('scripts'));
	gulp.watch('src/**/*.html', gulp.parallel('html'));
});

gulp.task('default', gulp.parallel('styles', 'scripts', 'browser-sync', 'watch'));

gulp.task('build', gulp.series('clean', 'export'))
