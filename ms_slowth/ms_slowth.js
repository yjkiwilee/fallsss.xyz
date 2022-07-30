var slowthImgMargin = 70; // Margin for placement of Ms Slowth X image in pixels

var slowthImgSizeMultiplier = 0.55;
var slowthImgSize = 0;
var slowthImgX = 0;
var slowthImgY = 0;

var prevWinwidth = 0;
var prevWinheight = 0;

var lineTimeInterval = 3000; // Time interval between adjacent lines in milliseconds

var viewerName = ""; // To be put in by the viewer

/*var msSlowthAudio = new Howl({
    src: ["https://cdn.glitch.me/ca53e489-dd2a-4dae-b990-d3a9f5325b87/MS.%20SLOWTH%20X.mp3?v=1658929949232"],
    html5: true
});*/

var msSlowthAudio = new Howl({
    src: ["./test_audio.m4a"],
    html5: true
});

// Utility functions


Math.constrain = function (val, lower, upper) {
    return Math.max(Math.min(val, upper), lower);
};

const sleep = ms => new Promise(r => setTimeout(r, ms));


// Functions for initialising / updating the MS SLOWTH image


function setMsSlowth() {
    $("#ms_slowth_img").css("width", slowthImgSize); // Image height is scaled automatically
    $("#ms_slowth_img").css("left", slowthImgX + "px");
    $("#ms_slowth_img").css("top", slowthImgY + "px");
}

function initialiseMsSlowth() {
    var currentWinwidth = $(window).width();
    var currentWinheight = $(window).height();

    var minDim = Math.min(currentWinwidth, currentWinheight);
    slowthImgSize = slowthImgSizeMultiplier * minDim;
    slowthImgX = Math.random() * (currentWinwidth - 2 * slowthImgMargin - slowthImgSize) + slowthImgMargin;
    slowthImgY = Math.random() * (currentWinheight - 2 * slowthImgMargin - slowthImgSize) + slowthImgMargin;

    setMsSlowth();

    prevWinwidth = currentWinwidth;
    prevWinheight = currentWinheight;
}

function updateMsSlowth() {
    var currentWinwidth = $(window).width();
    var currentWinheight = $(window).height();

    var minDim = Math.min(currentWinwidth, currentWinheight);
    slowthImgSize = slowthImgSizeMultiplier * minDim;
    slowthImgX = Math.constrain(slowthImgX / prevWinwidth * currentWinwidth, slowthImgMargin, currentWinwidth - slowthImgMargin - slowthImgSize);
    slowthImgY = Math.constrain(slowthImgY / prevWinheight * currentWinheight, slowthImgMargin, currentWinheight - slowthImgMargin - slowthImgSize);

    setMsSlowth();

    prevWinwidth = currentWinwidth;
    prevWinheight = currentWinheight;
}

function showMsSlowth() { $("#ms_slowth_img").css("display", "block"); }

function hideMsSlowth() { $("#ms_slowth_img").css("display", "none"); }


// Scene transition functions


async function playScene(sceneSelector) {
    $(sceneSelector).css("display", "block");

    var sceneChildren = $(sceneSelector + " > .line");

    for(var i = 0; i < sceneChildren.length; i++) {
        $(sceneChildren[i]).css("animation", "lineanim 3s ease-out forwards");
        $(sceneChildren[i]).css("animation", "lineanim 3s ease-out forwards");

        await sleep(lineTimeInterval);
    }
}

function hideScene(sceneSelector) {
    $(sceneSelector).css("display", "none");
}


// Event handlers


function onNameInput() {
    viewerName = $("#name_input").val();

    $(".viewer_name").html(viewerName);

    hideScene("#scene_1");
    playScene("#scene_2");
}

function onConnect() {
    hideScene("#scene_2");

    msSlowthAudio.play();
    showMsSlowth();
}

function onAudioComplete() {
    hideMsSlowth();

    playScene("#scene_4");
}

function onSendComment() {
    // Make AJAX request to FormSUBMIT

    $.ajax({
        url: "https://formsubmit.co/ajax/6444b614ab35d8809af2e436245866e1",
        method: "POST",
        dataType: "json",
        accepts: "application/json",
        data: {
            name: viewerName,
            message: $("#comment_field").val()
        }
    });
}


// Main function


$(function() {
    // Attach event handlers

    // Attach event handler to handle window resize events smoothly
    $(window).resize(updateMsSlowth);

    // Enter keystroke on name input field
    $(document).on("keypress", "input", function(e) {
        if(e.which == 13 && $(e.currentTarget).attr("id") == "name_input"){
            onNameInput();
            e.preventDefault();
        }
    });

    // On connect
    $(".connect").on("click", function(e) { onConnect(); });

    // On audio complete
    msSlowthAudio.on('end', onAudioComplete);

    // On comment form submit
    $("#submit_comment").on("click", function(e) { onSendComment(); });


    // Set MS SLOWTH X image size according to initial viewport size
    initialiseMsSlowth();

    
    // Play first scene
    playScene("#scene_1");
});