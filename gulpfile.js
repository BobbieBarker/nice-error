var gulp = require('gulp');
var eslint = require('gulp-eslint');
var cache = require('gulp-cached');
var path = require('path');
var rename = require('gulp-rename');
var chmod = require('gulp-chmod');
var fs = require('fs');
var bluebird = require('bluebird');
var gulpif = require('gulp-if');
var args = require('yargs').argv;

/**
 * [description]
 * @param  {[string]} fileName string representation of file path.
 * @return {[Promise]}         Promise indicating if file exists or not.
 */
var fileExists = (fileName) => {
  promiseFStat = bluebird.promisify(fs.stat);
  return promiseFStat(fileName);
};

/**
 * Lint task caches all files and only passes changed/uncached files to the linter
 * If a file passes linting it is cached, if it fails linting it is uncached.
 * Linting tasks fails after all errors are found.
 * Passing an arguement in the CLI of --cont=true will stop eslint from failing after error
 * which is necessary to run the linter continuously.
 */
gulp.task('lint', ['enforce-quality'], () => {
  // Read all js files within routes
  return gulp.src([
    'nice-error.js',
    '!nice-error.test.js',
    '!gulpfile.js',
    '!node_modules/**'
    ])
    .pipe(cache('eslint'))
    // Only uncached and changed files past this point
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.result((result) => {
      if (result.warningCount > 0 || result.errorCount > 0) {
        // If a file has errors/warnings remove uncache it
        delete cache.caches.eslint[path.resolve(result.filePath)];
      }
    }))
    .pipe(gulpif(!args.cont, eslint.failAfterError()));
});

/**
 * Watched for changes in the routes directory and calls the linting task as necessary.
 * If a file is deleted it removes it from the cache.
 */
gulp.task('lint-watch', ['lint'], () => {
  // ...and whenever a watched file changes
  return gulp.watch(['nice-error.js', 'nice-error.test.js'], ['lint'], (event) => {
    if (event.type === 'deleted' && cache.caches.eslint) {
      // remove deleted files from cache
      delete cache.caches.eslint[event.path];
    }
  });
});

/**
 * Checks for the presence of a pre push hook. If it doesn't exist the file is copied
 * into the correct location.
 */
gulp.task('enforce-quality', () => {
  fileExists('.git/hooks/pre-push').then((fsStatData) => {
    console.log('Pre-Push Hook Already Exists');
  }).catch((fsError) => {
    return gulp.src('misc/pre-push-hook.sh')
      .pipe(rename('/hooks/pre-push'))
      .pipe(chmod(755))
      .pipe(gulp.dest('.git'));
  });
});
