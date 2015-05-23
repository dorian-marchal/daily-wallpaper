'use strict';

var request = require('request');
var fs = require('fs');
var wallpaper = require('wallpaper');

var DailyWallpaper = function () {};

DailyWallpaper.prototype = {

    constructor: DailyWallpaper,
    directory: '',
    showNotification: false,

    /**
     * Set the directory if it exists
     * @param {String} directoryPath
     * @param {function} onDirectorySet Called when the directory is set
     *                                  with an optionnal error in parameter
     */
    setDirectory: function (directoryPath) {
        this.directory = directoryPath;
    },
    /**
     * Set the wallpaper of the day (showing a notification if needed)
     * @param {function} done Called when done (with optional error)
     */
    setDailyWallpaper: function (done) {

        done = done || function () {};

        if (!this.getWallpaperSource) {
            return done(new Error('DailyWallpaper.getWallpaperSource must be implemented'));
        }

        this.getWallpaperSource(function (err, wallpaperSource) {
            if (err) {
                return done(new Error('Error while getting the wallpaper of the day'));
            }

            if (!wallpaperSource || !wallpaperSource.url) {
                return done(new Error('Wallpaper URL not set'));
            }

            if (!this.directory) {
                return done(new Error('Directory is not set'));
            }

            if (!fs.existsSync(this.directory)) {
                return done(new Error('Directory "' + this.directory + '" doesn\'t exist'));
            }

            this._downloadWallpaper(wallpaperSource, function (err, filePath) {
                if (err) {
                    return done(new Error('Error while downloading the wallpaper at ' + wallpaperSource.url));
                }

                wallpaper.set(filePath, function (err) {
                    if (err) {
                        return done(new Error('Error while setting the wallpaper from ' + filePath));
                    }

                    return done();

                });
            });

        }.bind(this));
    },

    /**
     * Download the daily wallpaper in the wallpaper directory
     * @param {function} done Called when the download is done (with an optionnal error)
     *                        and filePath as second parameter
     */
    _downloadWallpaper: function (wallpaperSource, done) {

        var fileName = new Date().toISOString().substr(0, 10) + '.' + (wallpaperSource.extension || '.jpg');
        var filePath = this.directory + '/' + fileName;

        request.head(wallpaperSource.url, function(err) {

            if (err) {
                return done(err);
            }

            request(wallpaperSource.url)
                .pipe(fs.createWriteStream(filePath))
                .on('close', function () {
                    return done(null, filePath);
                })
                .on('error', function (err) {
                    return done(err);
                })
            ;
        });
    },

};

module.exports = DailyWallpaper;
