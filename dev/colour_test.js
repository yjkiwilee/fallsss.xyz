var veilFlag = false;

(function() {

    async function prepareVisual() {
        var canvas = document.getElementById("cvs");
        var ctxt = canvas.getContext("2d");

        var receivedTimes = await getTimes(new Date());

        var data = getColIndList(receivedTimes);

        var cs = data.colours;
        var is = data.indeces;

        /*console.log(cs);

        for(var i = 0; i < is.length; i ++) {
            console.log(new Date(is[i] * 100000));
        }*/

        var fallsssImg = document.getElementById("fallsssimg");
        var openInpt = document.getElementById("open");

        var frame = async function(colours, indeces, prevTime, prevImg, prevOpenCol) {

            var currentTime = new Date();

            var currentCol = colourPathLerp(colours, indeces, localTimeToRegionalTime(currentTime, timeOffset).getTime() / 100000);

            var lightness = hsluv.rgbToHsluv([currentCol.r, currentCol.g, currentCol.b])[2];

            //console.log(lightness);

            var currentImg = lightness < 50 ? "fallsss_inv_small.gif" : "fallsss_small.gif";
            var currentOpenCol = lightness < 50 ? "#ffffff" : "#000000";

            if(localTimeToRegionalTime(prevTime, timeOffset).getDate() != localTimeToRegionalTime(currentTime, timeOffset).getDate()) {
                var times = await getTimes(currentTime);
                var dat = getColIndList(times);

                var cols = dat.colours;
                var inds = dat.indeces;

                setTimeout(frame, 1000, cols, inds, currentTime, currentImg, currentOpenCol);
                return;
            }

            ctxt.fillStyle = currentCol.toString();
            ctxt.fillRect(0, 0, canvas.clientWidth, canvas.height);

            if(currentImg != prevImg) {
                fallsssImg.src = currentImg;
            }

            if(currentOpenCol != prevOpenCol) {
                openInpt.style.color = currentOpenCol;
            }

            setTimeout(frame, 1000, colours, indeces, currentTime, currentImg, currentOpenCol);
        }

        frame(cs, is, new Date());
        //document.getElementById("circle").setAttribute("style", "display: inline-block");

        var clock = function() {
            var timeString = localTimeToRegionalTime(new Date(), timeOffset).toString();
            timeString = timeString.split(' ').splice(0, 5);
            var temp = [...timeString];
            timeString[1] = temp[2];
            timeString[2] = temp[1];
            timeString = timeString.join(' ');
            //console.log(temp);
            //console.log(timeString);

            document.getElementById("time_debug").innerHTML = timeString;

            setTimeout(clock, 1000);
        }

        clock();
    }

    prepareVisual();

    //console.log(crawledDat);

    var fallsss = new Howl({
        src: ["fallsss.mp3"],
        loop: true
    });
    
    fallsss.once('load', function(){
        document.getElementById("veil").innerHTML = '<span style="display: table-cell; vertical-align: middle;">click or tap</span>';
        veilFlag = true;
        fallsss.play();
    });

})();

function onClick() {
    if(veilFlag) {
        document.getElementById("veil").setAttribute("style", "display: none;");
        veilFlag = false;
    }
}

function openModal() {
    document.getElementById("information").setAttribute("style", "display: block;");
    document.getElementById("open").style.display = "none";
}

function closeModal() {
    document.getElementById("information").setAttribute("style", "display: none;");
    document.getElementById("open").style.display = "inline-block";
}