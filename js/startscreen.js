(function() {
    "use strict";

    //-------- Audio ---------

    // verifica formatos suportados
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

    var layoutObject = document.getElementById("mainmenu"),
        largura = 1024,
        altura = 768;
    layoutObject.style.width = largura + "px";
    layoutObject.style.height = altura + "px";
    var lr = new LayoutResolver();
    lr.adjust("mainmenu", 1024, 768);

    //----- Carregamento do DOM -----

    document.addEventListener("DOMContentLoaded", function(event) {

        //--- relembrando a pontuação máxima ---

        var maxScoreDisplay = document.getElementById("maxscoredisplay");

        if (localStorage["maxscore"] == undefined) localStorage["maxscore"] = 0;

        maxScoreDisplay.innerHTML = "Pontuação Máxima: " + localStorage["maxscore"];

        //------- Botões de Interface -------

        //começa o jogo ao clicar no play
        var play = document.getElementById("play");
        play.onclick = function() {
            startSound.play();
            setTimeout(function() {
                window.location.href = "game.html";
            }, 400); //chama o jogo após meio segundo
        }

        //reseta a pontuação máxima
        var resetMaxScore = document.getElementById("resetmaxscore");
        resetMaxScore.onclick = function() {
            localStorage["maxscore"] = 0;
            maxScoreDisplay.innerHTML = "Pontuação Máxima: 0";
        }

    });

    window.onresize = function() {
        lr.adjust("mainmenu", largura, altura);
    }

})();
