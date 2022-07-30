window.isMobileDevice = function() {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
};

var slowthImgMargin = 70; // Margin for placement of Ms Slowth X image in pixels

var slowthImgSizeMultiplier = 0.57;
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

    if(window.isMobileDevice()) { // Make rescaling calculations only for mobile devices
        
        slowthImgSize = slowthImgSizeMultiplier * minDim;

    } else {

        slowthImgSize = min(458, minDim - 2 * slowthImgMargin); // Original dimensions or that allowed by the page if constrained

    }

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

    if(window.isMobileDevice()) { // Make rescaling calculations only for mobile devices
        
        slowthImgSize = slowthImgSizeMultiplier * minDim;

    } else {

        slowthImgSize = min(458, minDim - 2 * slowthImgMargin); // Original dimensions or that allowed by the page if constrained

    }
    
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