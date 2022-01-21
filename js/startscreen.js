(function() {
    "use strict";

    //-------- Audio ---------

    // checks supported audio
    function supportsOgg() {
        var a = document.createElement('audio');
        return !!(a.canPlayType && a.canPlayType('audio/ogg;').replace(/no/, ''));
    }

    function supportsM4a() {
        var a = document.createElement('audio');
        return !!(a.canPlayType && a.canPlayType('audio/mp4;').replace(/no/, ''));
    }
    //som do play
    var canPlayOgg = supportsOgg(),
        canPlayM4a = supportsM4a();

    if (canPlayOgg) {
        var startSound = new Audio("sound/start.ogg");
    } else if (canPlayM4a) {
        var startSound = new Audio("sound/start.m4a");
    }

    // ------ Layout -------

    var layoutObject = document.getElementById("main-menu"),
        largura = 1024,
        altura = 768;
    layoutObject.style.width = largura + "px";
    layoutObject.style.height = altura + "px";
    var lr = new LayoutResolver();
    lr.adjust("main-menu", 1024, 768);

    //----- DOM Loading -----

    document.addEventListener("DOMContentLoaded", function(event) {

        //--- showing max score---

        var maxScoreDisplay = document.getElementById("max-score-display");

        if (localStorage["max_score"] == undefined) localStorage["max_score"] = 0;

        maxScoreDisplay.innerHTML = "Max score: " + localStorage["max_score"];

        //------- Botões de Interface -------

        //começa o jogo ao clicar no play
        var play = document.getElementById("play");
        play.onclick = function() {
            startSound.play();
            setTimeout(function() {
                window.location.href = "game.html";
            }, 400);
        }

        //reseting max score
        var resetMaxScore = document.getElementById("reset-max-score");
        resetMaxScore.onclick = function() {
            localStorage["max_score"] = 0;
            maxScoreDisplay.innerHTML = "Max score: 0";
        }

    });

    window.onresize = function() {
        lr.adjust("main-menu", largura, altura);
    }

})();
