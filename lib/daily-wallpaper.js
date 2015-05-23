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
     * Return the wallpaper infos of the day
     * @param {function} done Called with (err, res) parameters, where res is the
     *                   infos of the daily wallpaper and 'err' an optional error
     *     {
     *         url: String,
     *         extension: String,
     *     }
     */
    getWallpaperSource: function (done) {
        throw new Error('DailyWallpaper.getWallpaperSource must be implemented');
    },

    /**
     * Set the wallpaper of the day (showing a notification if needed)
     * @param {function} done Called when done (with optional error)
     */
    setDailyWallpaper: function (done) {
        this.getWallpaperSource(function (err, wallpaperSource) {
            if (err) {
                console.error('Error while getting the wallpaper of the day');
                return done(err);
            }

            if (!wallpaperSource.url || ! wallpaperSource.extension) {
                return done(new Error('Wallpaper URL not set'));
            }

            this._downloadWallpaper(function (err, filePath) {
                if (err) {
                    console.error('Error while downloading the wallpaper at ' + wallpaperSource.url);
                    return done(err);
                }

                wallpaper.set(filePath, function (err) {
                    if (err) {
                        console.error('Error while setting the wallpaper from ' + filePath);
                        return done(err);
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

        var now = new Date();
        var fileName = now.toISOString().substr(0, 10) + '.' + wallpaperSource.extension;
        var filePath = this.directory + '/' + fileName;

        if (!fs.existsSync(this.directory)) {
            done(new Error('Directory "' + this.directory + '" doesn\'t exist'));
        }

        request.head(wallpaperSource.url, function(err, res, body) {
            request(wallpaperSource.url)
                .pipe(fs.createWriteStream(filePath))
                .on('close', function () {
                    done(null, filePath);
                })
                .on('error', function (err) {
                    done(err);
                })
            ;
        });
    },

};

module.exports = DailyWallpaper;
