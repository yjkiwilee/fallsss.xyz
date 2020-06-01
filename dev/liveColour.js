// this code assumes that a SolarPosition object named "sPos" was defined at main.js.
// and also a fractional timezone, "timezone".

// additional date functions, used to seed the daily random hue and saturation

Date.prototype.getDateString = function() {
    var year = this.getUTCFullYear();
    var month = this.getUTCMonth();
    var day = this.getUTCDate();

    return year.toString() + month.toString() + day.toString();
};

// main

var colFunc = {};

// a function that converts the date to a hue, saturation pair (a length 2 array) (hue: 0 ~ 360, saturation: 0 ~ 100)
colFunc.convertDateToHueSat = function(date) {
    // the timezone.toString() ensures that a change in the timezone causes the hue and saturation to change
    Math.seedrandom(date.getDateString() + timezone.toString());

    return [360 * Math.random(), 100 * Math.random()];
}

// lerp functions, 'step' functions

// receives a Date object and returns the appropriate lightness. (0 ~ 100)
colFunc.calcLightness = function(date) {
    var thetaSunset = -sPos.getApparentDiameter(date); // the altitude below which the Sun is considered to have set.
    var thetaAstro = -18; // the boundary altitude for astronomical twilight.

    var currentAlt = sPos.getAltitude(date);

    if(currentAlt < thetaAstro) { return 1; }
    else if(currentAlt > thetaSunset) { return 85; }
    else {
        // variables for lerp
        var m = 84 / (thetaSunset - thetaAstro);
        var c = 85 - m * thetaSunset;

        return m*currentAlt + c;
    }
}

// receives a Date object and returns the appropriate hue and saturation pair. ([0~360, 0~100])
// the hue and saturation will change rapidly when the Sun is at its lowest point on a day.
// many thanks to the person who made this brilliant illustration: http://notesfromnoosphere.blogspot.com/2012/05/simple-geometry-of-sun-paths.html
colFunc.calcHueSat = function(date) {
    var tempEndPoint = new Date(date.getTime());
    tempEndPoint.setUTCHours((36-timezone)%24, 0, 0, 0);

    // a and b are the noons that 'sandwich' the given date.
    var a, b;

    if(tempEndPoint.getTime() <= date.getTime()) {
        a = new Date(tempEndPoint.getTime());
        b = new Date(tempEndPoint.getTime() + 86400000);
    } else {
        a = new Date(tempEndPoint.getTime() - 86400000);
        b = new Date(tempEndPoint.getTime());
    }

    var aCol = this.convertDateToHueSat(a);
    var bCol = this.convertDateToHueSat(b);

    var midnightOffset = date.getTime() - (a.getTime() + b.getTime()) / 2;

    // hue and saturation will change, at 'midnight', over the course of a minute.
    if(midnightOffset < -30000) { return aCol; }
    else if(midnightOffset > 30000) { return bCol; }
    else {
        var lerp = [
            aCol[0] + (bCol[0]-aCol[0]) / 60000 * (midnightOffset+30000),
            aCol[1] + (bCol[1]-aCol[1]) / 60000 * (midnightOffset+30000)
        ];
        return lerp;
    }
}

// a function that sums everything up

colFunc.calcHSLuv = function(date) {
    return [...this.calcHueSat(date), this.calcLightness(date)];
}