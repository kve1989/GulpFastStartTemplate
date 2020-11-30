import gulp from "gulp";
import sass from "gulp-sass";
import scss from "gulp-sass";
import browserSync from "browser-sync";
import rename from "gulp-rename";
import concat from "gulp-concat";
import autoprefixer from "gulp-autoprefixer";
import webpack from "webpack-stream";

let localhost = "localhost:3000",
	preprocessor = "sass", // Preprocessor (sass, scss)
	fileswatch = "html,htm,php,txt,yaml,twig,json,md",
	src = "src",
	dist = "dist";

let paths = {
	scripts: {
		src: src + "/js/main.js",
		dest: dist + "/js",
	},

	styles: {
		src: src + "/" + preprocessor + "/main.*",
		dest: dist + "/css",
	},

	fonts: {
		src: src + "/" + "fonts/**/*",
	},

	images: {
		src: src + "/" + "images/**/*",
	},

	cssOutputName: "main.css",
	jsOutputName: "main.js",
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

/* copy */
export const copy = () => {
	return gulp
		.src([paths.fonts.src, paths.images.src, src + "/*.html"], {
			base: src,
		})
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
		.pipe(eval(preprocessor)())
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

/* watch */
export const watch = () => {
	gulp.watch(
		src + "/" + preprocessor + "/**/*",
		{ usePolling: true },
		styles
	);
	gulp.watch(src + "/**/*.js", { usePolling: true }, scripts);
	gulp.watch(
		[paths.fonts.src, paths.images.src, src + `**/*.{${fileswatch}}`],
		{ usePolling: true },
		gulp.series(copy)
	);
};

export default gulp.series(
	gulp.parallel(styles, scripts, copy),
	gulp.parallel(watch, browsersync)
);
