// https://github.com/unlight/gulp-cssimport
var gulp = require('gulp');
var cssimport = require("gulp-cssimport");
var concat = require('gulp-concat');
var pump = require('pump');
var gulpSequence = require('gulp-sequence').use(gulp)
var del = require('del');
var changed = require('gulp-changed');
var zip = require('gulp-zip');
var liquid = require("gulp-liquid");
var ext_replace = require('gulp-ext-replace');
const replace = require('gulp-replace');


var globalConfig = {
  scss_src: './src/scss', // your dev stylesheet directory. No trailing slash
  scripts_src: './src/scripts'
};

// Process CSS
gulp.task('styles', function() {
  return gulp.src(globalConfig.scss_src + '/**/*.*')
    .pipe(cssimport())
    .pipe(gulp.dest('./dist/assets/'));
})

gulp.task('scripts', function() {
  return gulp.src([
      globalConfig.scripts_src + '/lib/jquery.selectric.js',
      globalConfig.scripts_src + '/lib/sweetalert2.min.js',
      globalConfig.scripts_src + '/lib/date.js',
      globalConfig.scripts_src + '/lib/pinch-zoom.js',
      globalConfig.scripts_src + '/setup.js',
      globalConfig.scripts_src + '/theme/currency.js',
      globalConfig.scripts_src + '/theme/sections.js',
      globalConfig.scripts_src + '/theme/variants.js',
      globalConfig.scripts_src + '/customers.js',
      globalConfig.scripts_src + '/map.js',
      globalConfig.scripts_src + '/cookie-manager.js',
      globalConfig.scripts_src + '/product-card.js',
      globalConfig.scripts_src + '/drawers.js',
      globalConfig.scripts_src + '/modal.js',
      globalConfig.scripts_src + '/splash-modals.js',
      globalConfig.scripts_src + '/swatches.js',
      globalConfig.scripts_src + '/mobile-nav.js',
      globalConfig.scripts_src + '/header-section.js',
      globalConfig.scripts_src + '/slideshow-section.js',
      globalConfig.scripts_src + '/slider-section.js',
      globalConfig.scripts_src + '/product-template.js',
      globalConfig.scripts_src + '/collection-template.js',
      globalConfig.scripts_src + '/contact-template.js',
      globalConfig.scripts_src + '/featured-collection-section.js',
      globalConfig.scripts_src + '/featured-product-section.js',
      globalConfig.scripts_src + '/deal-of-the-day.js',
      globalConfig.scripts_src + '/top-bar.js',
      globalConfig.scripts_src + '/footer.js',
      globalConfig.scripts_src + '/admin.dev.js',
      globalConfig.scripts_src + '/check_license.js',
      globalConfig.scripts_src + '/init.js',
      globalConfig.scripts_src + '/password-page.js',
      globalConfig.scripts_src + '/instagram-feed.js',
    ])
    .pipe(concat('theme.js.liquid'))
    .pipe(gulp.dest('./dist/assets/'));
});

//clean task
gulp.task('clean', function() {
  return del([
    "./dist/**/*",
    "./tmp/**/*",
  ]);
});
//clean for build
gulp.task('clean_for_build', function() {
  return del([
    "./dist/config.yml",
    "./dist/config/settings_data.json",
    "./dist/config/settings_data.default.json",
  ]);
});
//copy default settings
gulp.task('copy_default_settings', function() {
  return gulp.src(
    "./src/config/settings_data.default.json"
    ).pipe(
      ext_replace('.json', '.default.json')
    ).pipe(
      gulp.dest('./dist/config')
    );
});

//gulp prepare test file
gulp.task('compile_liquid', function() {
  //example file: https://gist.github.com/tmslnz/1d025baaa7557a2d994032aa88fb61b3
  gulp.src([
      "./dist/**/theme.liquid",
      "./dist/**/*.liquid",
    ])
    // .pipe(replace(/({%)(?!\s*?(?:end)?(?:include)\s*?)(.+?)(%})/g, '<!-- $2 -->')) // make whitespace-insensitive tags {% -> {%-
    // .pipe(replace(/({%)(?!\s*?(?:end)?(?:raw|schema|javascript|stylesheet)\s*?)(.+?)(%})/g, '$1- $2 -$3')) // make whitespace-insensitive tags {% -> {%-
    .pipe(replace(/({%)(?: +)(include|section|schema|endschema|paginate|case|endcase|when|capture|endcapture)(.+?)(%})/g, '<!-- $2 -->')) // make whitespace-insensitive tags {% -> {%-
    .pipe(replace(/{%/g, '<!-- $2 -->')) // make whitespace-insensitive tags {% -> {%-
    .pipe(replace(/^\s*[\r\n]/gm, '')) // remove empty lines
    .pipe(replace(/escape/, ''))
    .pipe(replace(/{%-}/, '{%'))
    .pipe(replace(/-%}/, '%}'))
    // .pipe(replace(/({%)(?: +)(include|section|schema|endschema|paginate|case|when)(.+?)(%})/g, '<!-- $2 -->')) // make whitespace-insensitive tags {% -> {%-
    .pipe(liquid({
      locals: {

      }
    }))
    .pipe(ext_replace('.js', '.js.liquid'))
    .pipe(ext_replace('.html', '.html.liquid'))
    .pipe(ext_replace('.css', '.css.liquid'))
    .pipe(gulp.dest("./tmp/"));
});


//copy files
gulp.task('sync_files', function() {
  return gulp.src([
      "src/**/*",
      "!src/scripts/**/*",
      "!src/scss/**/*",
      "!src/scripts/",
      "!src/scss/"
    ])
    .pipe(changed("./dist/"))
    .pipe(gulp.dest('./dist/'));
});


// Watch files
gulp.task('watch', function() {

  gulp.watch([
    "src/**/*",
    "!src/scripts/**/*",
    "!src/scss/**/*",
    "!src/scripts/",
    "!src/scss/"
  ], ["sync_files"]);
  gulp.watch(globalConfig.scss_src + '/**/*.*', ['styles']);
  gulp.watch(globalConfig.scripts_src + '/**/*.js', ['scripts']);
});


//build
gulp.task('build', gulpSequence('clean', 'sync_files', 'styles', 'scripts', 'compile_liquid'));

// Default task
gulp.task('default', gulpSequence('build', 'watch'));



gulp.task("zip_build", function() {
  return gulp.src('./dist/**/*')
    .pipe(zip('konversion-theme.zip'))
    .pipe(gulp.dest('./dist'))
});

gulp.task('zip', gulpSequence('build', 'clean_for_build', 'copy_default_settings', 'zip_build'));
