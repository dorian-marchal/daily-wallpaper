'use strict';

var DailyWallpaper = require('../lib/daily-wallpaper');
var fs = require('fs');
var rimraf = require('rimraf');
var wallpaper = require('wallpaper');

describe('DailyWallpaper', function () {

    var dailyWall;
    var wallURL = 'https://cloud.githubusercontent.com/assets/6225979/7785233/ccb8f5e8-0186-11e5-847d-b33f14d75506.png';
    var testDir = '/tmp/test-daily-wallpaper';
    var currentWallpaper = null;

    beforeAll(function (done) {
        // Create a test dir
        fs.mkdir(testDir, function () {
            // Get the current wallpaper before changing it
            wallpaper.get(function (err, wallpaper) {
                if (err) {
                    throw err;
                }
                currentWallpaper = wallpaper;
                done();
            });
        });


    });

    beforeEach(function () {
        dailyWall = new DailyWallpaper();
    });

    describe('setDirectory', function () {
        it('should set the directory', function () {
            var newDir = '/my/new/directory';
            dailyWall.setDirectory(newDir);
            expect(dailyWall.directory).toEqual(newDir);
        });
    });

    describe('setDailyWallpaper', function () {

        it('should return an error if getWallpaperSource is not implemented', function (done) {
            dailyWall.setDailyWallpaper(function (err) {
                expect(err.message).toEqual('DailyWallpaper.getWallpaperSource must be implemented');
                done();
            });
        });

        it('should always call the callback', function (done) {

            var callbackCalled = false;

            dailyWall.setDailyWallpaper(function () {
                callbackCalled = true;
                expect(callbackCalled).toBe(true);
                done();
            });
        });

        it('should return an error if getWallpaperSource return an undefined source', function (done) {

            dailyWall.getWallpaperSource = function (done) {
                done();
            };

            dailyWall.setDailyWallpaper(function (err, wallpaperSource) {
                expect(wallpaperSource).not.toBeDefined();
                expect(err.message).toEqual('Wallpaper URL not set');
                done();
            });
        });

        it('should return an error if getWallpaperSource return an error', function (done) {

            dailyWall.getWallpaperSource = function (done) {
                done(new Error('toast'));
            };

            dailyWall.setDailyWallpaper(function (err) {
                expect(err.message).toEqual('Error while getting the wallpaper of the day');
                done();
            });
        });

        it('should return an error if getWallpaperSource return a source with a wrong url', function (done) {

            var url = 'plop';

            dailyWall.setDirectory(testDir);

            dailyWall.getWallpaperSource = function (done) {
                done(null, {
                    url: url,
                });
            };

            dailyWall.setDailyWallpaper(function (err) {
                expect(err.message).toEqual('Error while downloading the wallpaper at ' + url);
                done();
            });
        });

        it('should return an error if the directory is not set', function (done) {

            dailyWall.getWallpaperSource = function (done) {
                done(null, {
                    url: wallURL,
                });
            };

            dailyWall.setDailyWallpaper(function (err) {
                expect(err.message).toEqual('Directory is not set');
                done();
            });
        });

        it('should return an error if the directory doesn\'t exist', function (done) {

            dailyWall.setDirectory('/directory/that/should/not/exist/at/all');

            dailyWall.getWallpaperSource = function (done) {
                done(null, {
                    url: wallURL,
                });
            };

            dailyWall.setDailyWallpaper(function (err) {
                expect(err.message).toEqual('Directory "' + dailyWall.directory + '" doesn\'t exist');
                done();
            });
        });

        it('should download and save the wallpaper in the right place, with the right filename', function (done) {

            var extension = 'jpeg';
            var fileName = new Date().toISOString().substr(0, 10) + '.' + extension;
            var filePath = testDir + '/' + fileName;

            dailyWall.setDirectory(testDir);


            dailyWall.getWallpaperSource = function (done) {
                done(null, {
                    url: wallURL,
                    extension: extension,
                });
            };

            dailyWall.setDailyWallpaper(function () {
                expect(fs.existsSync(filePath)).toBe(true);
                done();
            });
        });

        it('should set the wallpaper to the new saved file', function (done) {

            var extension = 'jpeg';
            var fileName = new Date().toISOString().substr(0, 10) + '.' + extension;
            var filePath = testDir + '/' + fileName;

            dailyWall.setDirectory(testDir);

            dailyWall.getWallpaperSource = function (done) {
                done(null, {
                    url: wallURL,
                    extension: extension,
                });
            };

            dailyWall.setDailyWallpaper(function () {

                wallpaper.get(function (err, wallpaper) {
                    if (err) {
                        throw err;
                    }
                    expect(wallpaper).toEqual(filePath);
                    done();
                });
            });


        });
    });

    afterAll(function (done) {
        // Remove the test dir
        rimraf(testDir, function () {

            // Get the current wallpaper before changing it
            wallpaper.set(currentWallpaper, function () {
                done();
            });
        });
    });


});