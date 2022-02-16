var gulp = require("gulp"),
  // Fiber = require('fibers'),
  autoPrefixer = require("gulp-autoprefixer"),
  argv = require("minimist")(process.argv.slice(2)),
  browserSync = require("browser-sync").create(),
  reload = browserSync.reload,
  sass = require("gulp-dart-sass"),
  cleanCSS = require("gulp-clean-css"),
  merge = require("gulp-merge-json"),
  csso = require("gulp-csso"),
  del = require("del");
(gulpif = require("gulp-if")),
  (sourcemaps = require("gulp-sourcemaps")),
  (concat = require("gulp-concat")),
  (imagemin = require("gulp-imagemin")),
  (changed = require("gulp-changed")),
  (rename = require("gulp-rename")),
  (uglify = require("gulp-uglify")),
  (beautify = require("gulp-beautify-code")),
  (notify = require("gulp-notify")),
  (plumber = require("gulp-plumber")),
  (purgecss = require("gulp-purgecss")),
  (nunjucks = require("gulp-nunjucks")),
  (rendeNun = require("gulp-nunjucks-render")),
  (data = require("gulp-data")),
  (lineec = require("gulp-line-ending-corrector")),
  (purgecss = require("gulp-purgecss")),
  (filter = require("gulp-filter"));
  // sass.compiler = require('sass');
const destination = argv.clean
  ? "dist/demo/"
  : argv.pub
  ? "dist/publish/"
  : "dist/";
const port = argv.demo ? 4002 : argv.pub ? 4003 : 4001;

var sourcemap = argv.demo ? false : argv.pub ? true : true;
var minImg = argv.demo ? false : argv.pub ? true : false;
// All Path
const path = {
  root: "./",
  temp: "./app/temp/",
  html: "./src/*.+(html|njk)",
  htmlElem: "./app/components/**/*.+(html|njk)",
  _partialFiles: "./src/partials/**/*.+(htm|njk)",
  _partial: "./src/partials/",
  php: "./app/php/**/*.php",
  fonts: "./app/fonts/**/*.*",
  js: "./app/js/*.*",
  scss: "./app/scss/**/*.scss",
  escScss: "!./app/scss/bootstrap/**.scss",
  img: "./app/image/**/*.+(png|jpg|gif|ico|svg|webp)",
  data: "./app/data/data.json",
  jsonAll: "./src/database/*.json",
  plugins: "./app/plugins/**/*.*",
  pluginCss: "./app/plugins/**/*.css",
  bootstrap: "node_modules/bootstrap/scss/**/*.scss",
  vendorJs: ["node_modules/jquery/dist/jquery.min.js", "node_modules/jquery-migrate/dist/jquery-migrate.min.js", "node_modules/bootstrap/dist/js/bootstrap.bundle.js"],
  pluginJs: "./app/plugins/**/*.js",
  plugin: { js: "./app/plugin/js/*.js", css: "./app/plugin/css/*.css" },
};
// const folders = [path.php,path.js,path.plugins];

const dest = {
  css: destination + "css/",
  scss: destination + "scss/",
  js: destination + "js/",
  fonts: destination + "fonts/",
  php: destination + "php/",
  img: destination + "image/",
  plugins: destination + "plugins/",
  temp: destination + "temp/",
  elem: destination + "components/",
  bundle: { css: "bundled/css/", js: "bundled/js/" },
};

// const watchSrc = [path.html, path.js, path.php, path.img, path.fonts, path.plugin.css,path.plugin.css,path.plugin];

/* =====================================================
   BrowserSync
===================================================== */
function browserReload(done) {
  browserSync.init({
    server: {
      baseDir: destination + "./app/*.+(html|njk)",
    },
    port: port,
  });
  done();
}

/* =====================================================
    CLEAN
===================================================== */
function clean() {
  return del(["./app/**"]);
}

/*--------------------------------------
    Gulp Custom Notifier
----------------------------------------*/
function customPlumber([errTitle]) {
  return plumber({
    errorHandler: notify.onError({
      title: errTitle || "Error running Gulp",
      message: "Error: <%= error.message %>",
      sound: "Glass",
    }),
  });
}




/* =====================================================
    HTML
===================================================== */
function htmlmain(e) {
  return (
      delete require.cache[require.resolve("./src/db.json")],
      gulp
          .src([path.html])
          .pipe(data(require("./src/db.json")))
          .pipe(rendeNun({ path: [path._partial] }))
          .pipe(customPlumber("Error Running Nunjucks"))
          .pipe(beautify({ indent_size: 2, indent_char: " ", max_preserve_newlines: 0, unformatted: ["code", "pre", "em", "strong", "span", "i", "b", "br"] }))
          .pipe(gulp.dest("./app/"))
  );
}
function htmlElem(e) {
  return (
      delete require.cache[require.resolve("./src/db.json")],
      gulp
          .src([path.htmlElem])
          .pipe(data(require("./src/db.json")))
          .pipe(rendeNun({ path: [path._partial] }))
          .pipe(customPlumber("Error Running Nunjucks"))
          .pipe(beautify({ indent_size: 2, indent_char: " ", max_preserve_newlines: 0, unformatted: ["code", "pre", "em", "strong", "span", "i", "b", "br"] }))
          .pipe(gulp.dest(dest.elem))
  );
}
function json() {
  return gulp
      .src([path.jsonAll])
      .pipe(merge({ fileName: "db.json" }))
      .pipe(gulp.dest("./src/"));
}
exports.html = htmlElem;
const html = gulp.series(json, htmlmain);

/* =====================================================
    Scss
===================================================== */
function css() {
  return (
    gulp
      .src([path.scss, path.escScss])
      // .pipe(customPlumber('Error Running Sass'))
      // sourcemaps for Development
      .pipe(gulpif(sourcemap, sourcemaps.init()))
      .pipe(sass({ includePaths: ['./node_modules']}).on("error", sass.logError))
      .pipe(autoPrefixer())
      .pipe(
        gulpif(
          argv.demo,
          csso({
            restructure: false,
            sourceMap: true,
            debug: true,
          })
        )
      )
      .pipe(gulpif(sourcemap, sourcemaps.write("./maps/")))
      .pipe(lineec())
      .pipe(gulp.dest(dest.css))
  );
}
// function bootstrapCss() {
//   return (
//     gulp
//       .src([path.bootstrap])
//       // .pipe(customPlumber('Error Running Sass'))
//       // sourcemaps for Development
//       .pipe(gulp.dest("./app/scss/bootstrap/"))
//       .pipe(
//         browserSync.reload({
//           stream: true,
//         })
//       )
//   );
// }
const scss = gulp.parallel(css);

/* =====================================================
    Copy SCSS Folder
===================================================== */
function sassCopy() {
  return gulp.src("./src/scss/**/*.scss").pipe(gulp.dest("app/scss/"));
}
function imageCopy() {
  return gulp.src("./src/img/**/*").pipe(gulp.dest("app/img/"));
}
function jsCopy() {
  return gulp.src("./src/js/**/*.js").pipe(gulp.dest("app/js/"));
}
function pluginCopy() {
  return gulp.src("./src/plugins/**/*").pipe(gulp.dest("app/plugins/"));
}
function fonts() {
  return gulp.src("./src/fonts/**/*").pipe(gulp.dest("app/fonts/"));
}

/* =====================================================
    fonts Folder Copy
===================================================== */
// const copyAssets = gulp.parallel(php, plugins, fonts, image,jsCopy,pluginCopy,fonts);

// /* =====================================================
//     Purge Css
// ===================================================== */
// function sassCopy() {
//   return gulp.src("./").pipe(gulpif(argv.pub, gulp.dest(dest.scss)));
// }

function watchFiles() {
  gulp.watch(path.html, html);
  gulp.watch(path._partial, html);
  gulp.watch("./src/scss/**/*.scss", sassCopy);
  gulp.watch("./src/img/**/*", imageCopy);
  gulp.watch("./src/js/**/*", jsCopy);
  gulp.watch("./src/plugins/**/*", pluginCopy);
  gulp.watch("./src/fonts/**/*", fonts);
}

// const copyAssets = gulp.parallel(fonts,php, javascript, sassCopy, plugins,imgmin);
const build = gulp.series(
  clean,
  html,
  imageCopy,
  sassCopy,
  imageCopy,
  jsCopy,
  fonts,
  pluginCopy
);
const buildWatch = gulp.series(build, gulp.parallel(watchFiles));

exports.html = html;
exports.browserReload = browserReload;
exports.sassCopy = sassCopy;
exports.imageCopy = imageCopy;
exports.scss = scss;
exports.clean = clean;
exports.jsCopy = jsCopy;
exports.build = build;
exports.buildWatch = buildWatch;
exports.watchFiles = watchFiles;
exports.default = buildWatch;
