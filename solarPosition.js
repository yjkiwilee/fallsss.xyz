Math.TWO_PI = Math.PI*2;

// https://stackoverflow.com/questions/11759992/calculating-jdayjulian-day-in-javascript

Date.prototype.getJulian = function() { 
    return (this.getTime() / 86400000) - (this.getTimezoneOffset() / 1440) + 2440587.5;
}

Date.prototype.dateFromJulian = function(julian) {
    return new Date((julian - 2440587.5 + (this.getTimezoneOffset() / 1440)) * 86400000);
}

Date.prototype.UTCInDegrees = function() {
    return (this.getUTCHours() + this.getUTCMinutes()/60 + this.getUTCSeconds()/3600 + this.getUTCMilliseconds()/3600000) * 15;
}

// https://en.wikipedia.org/wiki/Position_of_the_Sun
// https://en.wikipedia.org/wiki/Sunrise_equation
// http://star-www.st-and.ac.uk/~fv/webnotes/chapter7.htm
// calculation does not account for atmospheric refraction... yet.

class SolarPosition {
    constructor(lat, long) {
        this.lat = lat;
        this.long = long;
        this.prev = {}; // for internal use
        this.solarRadius = 0.00465047; // the Sun's radius, in AU.
    }

    calculate(date) { // used internally
        if(this.prev.calcdate == date) { return; }

        // calculating the Sun's ecliptic coordinates

        // number of days since Greenwich noon Terrestrial Time 1 January 2000
        this.n = date.getJulian() - 2451545 + 0.0008;
        // mean longitude of the Sun in degrees
        this.L = (280.46 + 0.9856474 * this.n) % 360;
        // mean anomaly of the Sun in radians
        this.g = ((357.528 + 0.9856003 * this.n) % 360) / 360 * Math.TWO_PI;
        // the ecliptic longitude of the Sun in radians
        this.lambda = ((this.L + 1.915 * Math.sin(this.g) + 0.020 * Math.sin(2*this.g)) % 360) / 360 * Math.TWO_PI;
        // the obliquity of the ecliptic in radians
        this.epsilon = (23.439 - 0.0000004 * this.n) / 360 * Math.TWO_PI;
        // the solar transit
        this.sTransit = 2451545.0 + this.n + 0.0053 * Math.sin(this.g) - 0.0069 * Math.sin(2 * this.lambda)

        // converting to the Sun's equatorial coordinates

        // the right ascension of the Sun in degrees
        this.alpha = Math.atan2(Math.cos(this.epsilon) * Math.sin(this.lambda), Math.cos(this.lambda)) / Math.TWO_PI * 360;
        // the declination of the Sun in radians
        this.delta = Math.asin(Math.sin(this.epsilon) * Math.sin(this.lambda));

        // converting to the Sun's horizontal coordinates (at the given position)
        
        // the local sidereal time in degrees (https://astronomy.stackexchange.com/questions/24859/local-sidereal-time)
        this.LST = 100.4606184 + 0.9856473662862 * this.n + this.long + date.UTCInDegrees();
        // the local hour angle in radians
        this.H = (this.LST - this.alpha) / 360 * Math.TWO_PI;

        this.prev.calcdate = date;
    }

    getAltitude(date) {
        if(this.prev.altdate === undefined && date === undefined) { return undefined; } 
        if(this.prev.altdate == date || date === undefined) { return this.altitude; }

        this.calculate(date);

        var latrad = this.lat / 360 * Math.TWO_PI;

        this.altitude = Math.asin(Math.sin(this.delta) * Math.sin(latrad) + Math.cos(this.delta) * Math.cos(latrad) * Math.cos(this.H)) / Math.TWO_PI * 360;
        this.prev.altdate = date;

        return this.altitude;
    }

    getAzimuth(date) {
        if(this.prev.azimdate === undefined && date === undefined) { return undefined; } 
        if(this.prev.azimdate == date || date === undefined) { return this.azimuth; }

        this.calculate(date);

        this.azimuth = Math.asin(-Math.sin(this.H) * Math.cos(this.delta) / Math.cos(this.getAltitude(date) / 360 * Math.TWO_PI)) / Math.TWO_PI * 360;
        this.prev.azimdate = date;

        return this.azimuth;
    }

    getDistanceToSun(date) { // calculates the distance from the Earth to the Sun, in AU.
        if(this.prev.distdate === undefined && date === undefined) { return undefined; } 
        if(this.prev.distdate == date || date === undefined) { return this.distance; }

        this.calculate(date);

        // distance to the Sun in AU
        this.distance = 1.00014 - 0.01671 * Math.cos(this.g) - 0.00014 * Math.cos(2*this.g);
        this.prev.distdate = date;

        return this.distance;
    }

    getApparentDiameter(date) { // calculates the apparent size of the Sun, in degrees.
        if(this.prev.appdiamdate === undefined && date === undefined) { return undefined; } 
        if(this.prev.appdiamdate == date || date === undefined) { return this.apparentDiam; }

        this.apparentDiam = 2*Math.atan(this.solarRadius / this.getDistanceToSun(date)) / Math.TWO_PI * 360;
        this.prev.appdiamdate = date;

        return this.apparentDiam;
    }

    getSunTimes(date) {
        if(this.prev.suntimesdate === undefined && date === undefined) { return undefined; } 
        if(this.prev.suntimesdate == date || date === undefined) { return { sunrise: this.sunrise, sunset: this.sunset }; }

        this.calculate(date);

        this.suntimeAngle = Math.acos((Math.sin(-0.83 / 360 * Math.TWO_PI) - Math.sin(this.lat / 360) * Math.sin(this.delta)) / (Math.cos(this.lat / 360) * Math.cos(this.delta)));
        this.sunrise = this.sTransit - this.suntimeAngle / Math.TWO_PI;
        this.sunset = this.sTransit + this.suntimeAngle / Math.TWO_PI;

        return {
            sunriseJulian : this.sunrise,
            sunsetJulian : this.sunset
        };
    }
}