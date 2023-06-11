var sPos = new SolarPosition(45.5019, -73.5674);
const timezone = sPos.long / 15; // fractional timezone.
const discreteTimezone = -4; // discrete Timezone for clock display.
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var currTime = new Date();
var veil;
var fallsssImg;
var infoOpen;
var infoPanel;
var fallsssAudio;

window.onload = function() {

    veil = document.querySelector("#veil");
    fallsssImg = document.querySelector("#fallsssimg");
    infoOpen = document.querySelector("#open");
    infoPanel = document.querySelector("#information");

    fallsssAudio = new Howl({
        src: ["fallsss.mp3"],
        html5: true,
        loop: true
    });
    
    /*fallsssAudio.once('load', function(){
        veil.loadingDone = true;

        veil.children[0].innerHTML = "click or tap<br>(sound on)";
    });*/

    veil.loadingDone = true;
    veil.children[0].innerHTML = "click or tap<br>(sound on)";

    update();
};

function openModal() {
    infoPanel.style.display = "block";
    infoOpen.style.visibility = "hidden";
}

function closeModal() {
    infoPanel.style.display = "none";
    infoOpen.style.visibility = "visible";
}

function onClick() {
    if(veil.loadingDone) {
        veil.style.display = "none";
        fallsssImg.style.visibility = "visible";
        infoOpen.style.visibility = "visible";
        fallsssAudio.play();
    }
}

async function update() {
    // colour part

    currTime = new Date();
    var col = colFunc.calcHSLuv(currTime);
    document.body.style.backgroundColor = hsluv.hsluvToHex(col);
    var fallsssSrcFile = fallsssImg.src.split('/').slice(-1)[0];

    if(col[2] > 50) { // if the background is light
        veil.style.color = "black";
        if(fallsssSrcFile != "fallsss_small.gif") { fallsssImg.src = "fallsss_small.gif"; }
        infoOpen.style.color = "black";
    } else { // if the background is dark
        veil.style.color = "white";
        if(fallsssSrcFile != "fallsss_inv_small.gif") { fallsssImg.src = "fallsss_inv_small.gif"; }
        infoOpen.style.color = "white";
    }

    testDate = new Date();

    // clock part

    var clockTime = new Date(testDate.getTime() + 1000*60*60*discreteTimezone);
    var timeDateString = clockTime.getTimeDateString();
    var suntimes = colFunc.getSunTimes(currTime);
    var sunriseString = new Date(suntimes.sunrise.getTime() + 1000*60*60*discreteTimezone).getTimeString();
    var sunsetString = new Date(suntimes.sunset.getTime() + 1000*60*60*discreteTimezone).getTimeString();

    document.getElementById("time_debug").innerHTML = timeDateString;
    document.getElementById("sunrise_time").innerHTML = sunriseString;
    document.getElementById("sunset_time").innerHTML = sunsetString;

    setTimeout(update, 1000);
}