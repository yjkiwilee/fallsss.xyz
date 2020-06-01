var sPos = new SolarPosition(51.509865, 0.01);
var timezone = sPos.long / 15; // fractional timezone.
var currTime = new Date();
var veil;
var fallsssImg;
var infoOpen;
var infoPanel;

window.onload = function() {
    veil = document.querySelector("#veil");
    fallsssImg = document.querySelector("#fallsssimg");
    infoOpen = document.querySelector("#open");
    infoPanel = document.querySelector("#information");

    var fallsss = new Howl({
        src: ["fallsss.mp3"],
        loop: true
    });
    
    fallsss.once('load', function(){
        veil.style.display = "none";
        fallsssImg.style.visibility = "visible";
        infoOpen.style.visibility = "visible";
        
        fallsss.play();
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

async function update() {
    var col = colFunc.calcHSLuv(currTime);
    document.body.style.backgroundColor = hsluv.hsluvToHex(col);

    if(col[2] > 50) { // if the background is light
        veil.style.color = "black";
        fallsssImg.src = "fallsss_small.gif";
        infoOpen.style.color = "black";
    } else { // if the background is dark
        veil.style.color = "white";
        fallsssImg.src = "fallsss_inv_small.gif";
        infoOpen.style.color = "white";
    }

    testDate = new Date();

    setTimeout(update, 1000);
}