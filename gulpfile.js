let gulp = require('gulp'),
	sass = require('gulp-sass'),
	browserSync = require('browser-sync'),
	rename = require('gulp-rename'),
	uglify = require('gulp-uglify'),
	concat = require('gulp-concat'),
	autoprefixer = require('gulp-autoprefixer'),
	del = require('del'),
	kit = require('gulp-kit');

// Local Server
gulp.task('browser-sync', function () {
	browserSync.init({
		server: {
			baseDir: "app/"
		},
		notify: false,
	});
});

// Task clean folder dist
gulp.task('clean', async function () {
	del.sync('dist')
})

// HTML
gulp.task('html', function () {
	return gulp.src('app/**/*.html')
		.pipe(browserSync.reload({
			stream: true
		}))
});

// Kit
gulp.task('kit', function () {
	return gulp.src('src/*.kit')
		.pipe(kit())
		.pipe(gulp.dest('app/'))
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
		.pipe(gulp.dest('app/css'))
		.pipe(browserSync.stream())
});

// Custom Scripts
gulp.task('scripts', function () {
	return gulp.src('app/js/**/*.js')
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
	gulp.watch('app/js/*.js', gulp.parallel('scripts'));
	gulp.watch('app/**/*.html', gulp.parallel('html'));
	gulp.watch('src/**/*.kit', gulp.parallel('kit'));
});

gulp.task('default', gulp.parallel('styles', 'scripts', 'browser-sync', 'watch'));

gulp.task('build', gulp.series('clean', 'export'))
