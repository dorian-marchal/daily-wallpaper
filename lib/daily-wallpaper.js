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
     * Set the wallpaper of the day
     * @param {function} done Called when done (with optional error)
     */
    setDailyWallpaper: function (done) {

        done = done || function () {};

        this._getWallpaperPath(function (err, wallpaperPath) {
            if (err) {
                return done(err);
            }

            wallpaper.set(wallpaperPath, function (err) {
                if (err) {
                    return done(new Error('Error while setting the wallpaper from ' + wallpaperPath));
                }

                return done();
            });

        });
    },

    /**
     * Get the daily wallpaper path from this.getWallpaperSource
     */
    _getWallpaperPath: function (done) {
        if (!this.getWallpaperSource) {
            return done(new Error('DailyWallpaper.getWallpaperSource must be implemented'));
        }

        this.getWallpaperSource(function (err, wallpaperSource) {
            if (err) {
                return done(new Error('Error while getting the wallpaper of the day'));
            }

            if (!wallpaperSource || (!wallpaperSource.url && !wallpaperSource.path)) {
                return done(new Error('Wallpaper source is not set'));
            }

            // If the source is a remote one, we download the file
            if (wallpaperSource.url) {

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
                    return done(null, filePath);
                });
            }
            else {
                if (!fs.existsSync(wallpaperSource.path)) {
                    return done(new Error('The wallpaper file doesn\'t exist at ' + wallpaperSource.path));
                }
                return done(null, wallpaperSource.path);
            }

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
