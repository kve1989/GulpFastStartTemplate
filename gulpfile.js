import gulp from "gulp";
import gulpSass from "gulp-sass";
import dartSass from "sass";
import sassglob from "gulp-sass-glob";
import browserSync from "browser-sync";
import rename from "gulp-rename";
import concat from "gulp-concat";
import imagemin from "gulp-imagemin";
import autoprefixer from "gulp-autoprefixer";
import plumber from "gulp-plumber";
import webpack from "webpack-stream";
import { deleteAsync } from "del";
import panini from "panini";

const sass = gulpSass(dartSass);

let localhost = "localhost:3000",
	fileswatch = "html,php,txt,yaml,twig,json,md",
	src = "src",
	dist = "dist",
	preprocessor = 'scss';

let paths = {
	scripts: {
		src: src + "/js/app.js",
		dest: dist + "/js",
	},

	styles: {
		src: src + "/" + preprocessor + "/app.*",
		dest: dist + "/css",
	},

	fonts: {
		src: src + "/" + "fonts/**/*",
	},

	images: {
		src: src + "/" + "images/**/*",
	},

	cssOutputName: "app.css",
	jsOutputName: "app.js",
};

/* browsersync */
export const browsersync = () => {
	browserSync.init({
		server: { baseDir: dist + "/" },
		// proxy: localhost, // for PHP
		notify: false,
		ui: false,
	});
};

/* html */
export const html = () => {
	return gulp
        .src(src + "/*.html")
        .pipe(plumber())
        .pipe(
            panini({
                root: src,
                layouts: src + "/layouts",
                partials: src + "/partials",
            })
        )
        .pipe(gulp.dest(dist))
        .pipe(browserSync.reload({ stream: true }));
};

/* copy */
export const copy = () => {
	return gulp
		.src([paths.fonts.src, paths.images.src], {
			base: src,
		})
		.pipe(plumber())
		.pipe(imagemin())
		.pipe(gulp.dest(dist))
		.pipe(
			browserSync.stream({
				once: true,
			})
		);
};

/* styles */
export const styles = () => {
	return gulp
		.src(paths.styles.src)
		.pipe(plumber())
		.pipe(sassglob())
		.pipe(sass({ outputStyle: "compressed" }))
		.pipe(concat(paths.cssOutputName))
		.pipe(
			autoprefixer({
				overrideBrowserslist: ["last 10 versions"],
				grid: true,
			})
		)
		.pipe(gulp.dest(paths.styles.dest))
		.pipe(browserSync.stream());
};

/* scripts */
export const scripts = () => {
	return gulp
		.src(paths.scripts.src)
		.pipe(plumber())
		.pipe(
			webpack({
				mode: "production",
				module: {
					rules: [
						{
							test: /\.m?js$/,
							exclude: /(node_modules|bower_components)/,
							use: {
								loader: "babel-loader",
								options: {
									presets: [
										[
											"@babel/preset-env",
											{
												debug: true,
												corejs: 3,
												useBuiltIns: "usage",
											},
										],
									],
								},
							},
						},
					],
				},
			})
		)
		.pipe(rename(paths.jsOutputName))
		.pipe(gulp.dest(paths.scripts.dest))
		.pipe(browserSync.stream());
};

/* del */
export const clean = () => {
	return deleteAsync(dist);
};

/* watch */
export const watch = () => {
	gulp.watch(
		src + "/" + preprocessor + "/**/*",
		{ usePolling: true },
		styles
	);
	gulp.watch(src + "/**/*.js", { usePolling: true }, scripts);
	gulp.watch(src + "/**/*.html", { usePolling: true }, html);
	gulp.watch(
		[paths.fonts.src, paths.images.src, src + `**/*.{${fileswatch}}`],
		{ usePolling: true },
		gulp.series(copy)
	);
};

export default gulp.series(
	gulp.series(clean, gulp.parallel(html, styles, scripts, copy)),
	gulp.parallel(watch, browsersync)
);
