(function () {
'use strict';

var gulp = require('gulp');
var plumber = require('gulp-plumber');
var notify = require('gulp-notify');
var notifier = require('node-notifier');
var jasmine = require('gulp-jasmine');

var distPath = './lib';

gulp.task('live', ['live-test']);

// Jasmine
var specWatch = './test/*spec.js';
gulp.task('test', function () {

    var error = false;

    return gulp.src([specWatch, distPath + '/*.js'])
        .pipe(plumber())
        .pipe(jasmine({
            verbose: true,
            includeStackTrace: true,
        }))
        .on('error', notify.onError(function () {
            error = true;
            return {
                title: 'Jasmine Test Failed',
                message: 'One or more tests failed, see the cli for details.',
            };
        }))
        .on('end', function () {
            if (!error) {
                notifier.notify({
                    title: 'Jasmine Test Success',
                    message: 'Every tests passed :)',
                });
            }
        })
    ;
});

gulp.task('live-test', function () {
    return gulp.watch([specWatch, distPath + '/*.js'], ['test']);
});



})();
