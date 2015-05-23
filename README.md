# daily-wallpaper

Helps you set a daily wallpaper from a given remote source.

### Installation

```bash
npm install --save daily-wallpaper
```

### Usage

```js
var DailyWallpaper = require('daily-wallpaper');

var dailyWall = new DailyWallpaper();

// Set the directory for the downloaded wallpapers
dailyWall.setDirectory('/tmp');

// Implements the getWallpaperSource method.
// This method must call the 'done' callback with an object representing the
// wallpaper of the current day as the second parameter.
// The first parameter is reserved to an eventual error.
dailyWall.getWallpaperSource = function (done) {
    var wallpapers = [
        'http://ubuntu.ecchi.ca/wallpapers/9.10//Cherries.jpg',
        'http://ubuntu.ecchi.ca/wallpapers/10.04//BosqueTK.jpg',
        'http://ubuntu.ecchi.ca/wallpapers/9.10//Frog.jpg',
        'http://ubuntu.ecchi.ca/wallpapers/9.10//Naranja.jpg',
        'http://ubuntu.ecchi.ca/wallpapers/10.10//Smile_by_quinn.anya.jpg',
        'http://ubuntu.ecchi.ca/wallpapers/10.10//Blue_box_number_2_by_orb9220.jpg',
        'http://ubuntu.ecchi.ca/wallpapers/10.10//Aeg_by_Tauno_Erik.jpg',
    ];

    return done(null, {
        url: wallpapers[new Date().getDay()],
        extension: 'jpg',
    });
};

// Set the daily wallpaper.
// The passed callback is called with an error as parameter if something went wrong
dailyWall.setDailyWallpaper(function (err) {
    if (err) {
        throw err;
    }
});

```
