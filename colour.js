Math.lerp = function (a, b, prog) {
    return a + (b - a) * prog;
}

class Colour {
    constructor (cor, g, b) {
        this.GAMMA = 2.2;

        if (g === undefined || b === undefined) {
            this.r = cor.r;
            this.g = cor.g;
            this.b = cor.b;
        } else {
            this.r = cor / 255;
            this.g = g / 255;
            this.b = b / 255;
        }
    }

    toString () {
        return "rgb(" + Math.floor(this.r * 255).toString() + "," + Math.floor(this.g * 255).toString() + "," + Math.floor(this.b * 255).toString() + ")";
    }

    getHue() {
        let max = Math.max(this.r, this.g, this.b);
        let min = Math.min(this.r, this.g, this.b);

        if(max == this.r) {
            return (60 * ((this.g - this.b) / (max - min)) + 360) % 360;
        } else if(max == this.b) {
            return (60 * (2 + (this.b - this.r) / (max - min)) + 360) % 360;
        } else {
            return (60 * (4 + (this.r - this.g) / (max - min)) + 360) % 360;
        }
    }

    /*
        the function below 'linearises' the r, g and b values.
        'Linearisation' means that after being processed by this function,
        the r, g and b values will linearly represent the physical brightness.
    */
    linearise () {
        var lr = Math.pow(this.r, this.GAMMA);
        var lg = Math.pow(this.g, this.GAMMA);
        var lb = Math.pow(this.b, this.GAMMA);

        return new Colour(lr * 255, lg * 255, lb * 255);
    }

    encode () {
        var er = Math.pow(this.r, 1 / this.GAMMA);
        var eg = Math.pow(this.g, 1 / this.GAMMA);
        var eb = Math.pow(this.b, 1 / this.GAMMA);

        return new Colour(er * 255, eg * 255, eb * 255);
    }

    static lerp (c1, c2, prog) {
        var lc1 = c1.linearise();
        var lc2 = c2.linearise();

        var lerpr = Math.lerp(lc1.r, lc2.r, prog);
        var lerpg = Math.lerp(lc1.g, lc2.g, prog);
        var lerpb = Math.lerp(lc1.b, lc2.b, prog);

        var res = new Colour(lerpr * 255, lerpg * 255, lerpb * 255);
        res = new Colour(res.encode());

        return res;
    }
}

function colourPathLerp (colours, indeces, prog) {

    if(prog <= indeces[0]) {
        return colours[0];
    } else if(prog >= indeces[indeces.length - 1]) {
        return colours[colours.length - 1];
    }

    var index;

    for (var i = 0; i < indeces.length; i++) {
        if (indeces[i] >= prog) {
            index = i;
            break;
        }
    }

    var c1 = colours[index - 1];
    var c2 = colours[index];
    var rc = Colour.lerp(c1, c2, (prog - indeces[index - 1]) / (indeces[index] - indeces[index - 1]));

    return rc;
};

