var sPos = new SolarPosition(60.449522, 22.249796);
const timezone = sPos.long / 15; // fractional timezone.
const discreteTimezone = 1; // discrete Timezone for clock display.
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
        loop: true
    });
    
    fallsssAudio.once('load', function(){
        veil.loadingDone = true;

        veil.children[0].innerHTML = "click or tap<br>(sound on)";
    });

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
    var hourString = clockTime.getUTCHours().toString();
    hourString = hourString.length == 1 ? "0"+hourString : hourString;
    var minuteString = clockTime.getUTCMinutes().toString();
    minuteString = minuteString.length == 1 ? "0"+minuteString : minuteString;
    var secondString = clockTime.getUTCSeconds().toString();
    secondString = secondString.length == 1 ? "0"+secondString : secondString;

    var timeString = clockTime.getUTCDate() + " "
        + monthNames[clockTime.getUTCMonth()] + " "
        + clockTime.getUTCFullYear() + " "
        + hourString + ":" + minuteString + ":" + secondString;

    document.getElementById("time_debug").innerHTML = timeString;

    setTimeout(update, 1000);
}