let w = (-0.0722 + 0.2126) / 0.7152;
let W = 0.2848 / 0.7152;

let a = 1/2 - w / (2*W);

let inva = a / (2 * (1 - a));

function primFilter(x) {
    if(0 <= x && x < inva) {
        return Math.sqrt(2 * a * (1 - a) * x);
    } else if(x < 1 - inva) {
        return (1 - a) * x + a / 2;
    } else if(x <= 1) {
        return -(Math.sqrt(-2 * a * (1 - a) * (x - 1))) + 1;
    } else {
        return undefined;
    }
}

function randomGFilter(x, v) {
    // this function is a filter function that will output a valid random g value.

    if(v == 0 || v == 1) {
        return 1;
    }

    let g_m = v / 0.7152;
    let g_M = (v - 0.2848) / 0.7152;
    let w_tot = 1 / (g_m - g_M);

    let vl1 = -(1 + w_tot) * v + 1;
    let vl2 = vl1 + w_tot;

    if(0 <= vl1 && vl1 <= 1) {
        let orgHeight = 1 - primFilter(vl1);
        var transX = (x - 1) * (1 - vl1) + 1;

        //console.log(transX);

        var res = primFilter(transX);

        //console.log(res);
        res -= 1;
        res /= orgHeight;
        res += 1;

        return res;
    } else if(0 <= vl2 && vl2 <= 1) {
        let orgHeight = primFilter(vl2);
        var transX = x * vl2;

        var res = primFilter(transX);
        res /= orgHeight;

        return res;
    } else {
        var res = primFilter(x);

        return res;
    }
}

function randomToGValue(x, v) {
    // x is [0,1]
    let g_m = v / 0.7152;
    let g_M = (v - 0.2848) / 0.7152;

    let lb = Math.max(g_M, 0);
    let ub = Math.min(g_m, 1);
    let diff = ub - lb;

    var transX = x * diff + lb;

    return transX;
}

function randomRGBfromGV(g, v) {
    let lx = Math.max((0.0722 + 0.7152*g - v) / -0.2126, 0);
    let rx = Math.min((v - 0.7152*g) / 0.2126, 1);

    if(lx > rx) {
        return undefined;
    }

    let diff = rx - lx;
    
    var R = Math.random() * diff + lx;
    var B = (v - 0.2126*R - 0.7152*g) / 0.0722;

    R = Math.min(Math.max(R, 0), 1);
    B = Math.min(Math.max(B, 0), 1);

    return new Colour(R*255, g*255, B*255).encode();
}

function randomColourOfV(v) {
    let G = randomToGValue(randomGFilter(Math.random(),v),v);

    return randomRGBfromGV(G, v);
}